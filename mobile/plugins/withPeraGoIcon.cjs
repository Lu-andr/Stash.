const { withFinalizedMod } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

// Preserve the supplied PNG; inset its drawable so launcher masks do not crop the wordmark.
module.exports = config => withFinalizedMod(config, ['android', async mod => {
  const res = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res');
  await fs.mkdir(path.join(res, 'drawable'), { recursive: true });
  await fs.writeFile(path.join(res, 'drawable/perago_launcher_foreground.xml'), `<?xml version="1.0" encoding="utf-8"?>
<inset xmlns:android="http://schemas.android.com/apk/res/android"
    android:insetLeft="20%" android:insetTop="20%" android:insetRight="20%" android:insetBottom="20%"
    android:drawable="@mipmap/ic_launcher_foreground" />
`);
  const folder = path.join(res, 'mipmap-anydpi-v26');
  for (const name of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
    const file = path.join(folder, name);
    const source = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, source.replace('@mipmap/ic_launcher_foreground', '@drawable/perago_launcher_foreground'));
  }
  return mod;
}]);
