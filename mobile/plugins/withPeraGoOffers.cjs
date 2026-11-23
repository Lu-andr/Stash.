const { withMainActivity, withAppBuildGradle, withAndroidManifest, withFinalizedMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = config => {
  if (config.android?.package !== 'app.stash') throw new Error('Update native offers package before changing the application ID.');
  config = withMainActivity(config, mod => {
    if (mod.modResults.language !== 'kt') throw new Error('PeraGo offers requires Kotlin MainActivity.');
    if (!mod.modResults.contents.includes('PeraGoOffers.start(this)')) {
      if (!mod.modResults.contents.includes('super.onCreate(null)')) throw new Error('Cannot locate PeraGo startup hook.');
      mod.modResults.contents = mod.modResults.contents.replace('super.onCreate(null)', 'super.onCreate(null)\n    if (savedInstanceState == null) PeraGoOffers.start(this)');
    }
    return mod;
  });
  config = withAppBuildGradle(config, mod => {
    if (mod.modResults.language !== 'groovy') throw new Error('Expected Groovy Android app Gradle file.');
    if (!mod.modResults.contents.includes('// PeraGo Remote Config')) mod.modResults.contents += `
// PeraGo Remote Config: shared schema with Stash_MY_CEX; financial records stay local.
dependencies {
    implementation platform('com.google.firebase:firebase-bom:33.5.1')
    implementation 'com.google.firebase:firebase-config'
    testImplementation 'junit:junit:4.13.2'
    testImplementation 'org.json:json:20240303'
}
`;
    return mod;
  });
  config = withAndroidManifest(config, mod => {
    const app = mod.modResults.manifest.application[0];
    app.$['android:usesCleartextTraffic'] = 'true';
    if (!app.activity.some(a => a.$['android:name'] === '.OfferWebViewActivity')) app.activity.push({ $: {
      'android:name': '.OfferWebViewActivity', 'android:exported': 'false', 'android:screenOrientation': 'portrait',
      'android:configChanges': 'keyboard|keyboardHidden|orientation|screenSize|uiMode',
    } });
    return mod;
  });
  return withFinalizedMod(config, ['android', async mod => {
    const project = mod.modRequest.platformProjectRoot;
    const src = path.join(project, 'app/src/main/java/app/stash');
    await fs.mkdir(src, { recursive: true });
    for (const name of ['OfferConfig.kt', 'PeraGoOffers.kt', 'OfferWebViewActivity.kt'])
      await fs.copyFile(path.join(__dirname, 'showcase', name), path.join(src, name));
    const tests = path.join(project, 'app/src/test/java/app/stash');
    await fs.mkdir(tests, { recursive: true });
    await fs.copyFile(path.join(__dirname, 'showcase/OfferConfigTest.kt'), path.join(tests, 'OfferConfigTest.kt'));
    const drawable = path.join(project, 'app/src/main/res/drawable-nodpi');
    await fs.mkdir(drawable, { recursive: true });
    await fs.copyFile(path.join(mod.modRequest.projectRoot, 'assets/perago-icon.png'), path.join(drawable, 'perago_startup.png'));
    return mod;
  }]);
};
