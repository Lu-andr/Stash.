const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
for (const file of [path.resolve('App.tsx'), ...files(path.resolve('src')).filter(f => /\.tsx?$/.test(f))]) {
  let source = fs.readFileSync(file, 'utf8');
  // Only this fixed, user-initiated external browser link is allowed.
  if (file === path.resolve('src/constants/legal.ts')) {
    assert.equal(source.trim(), "export const PRIVACY_POLICY_URL = 'https://loanshark.cc/privacy.html';");
    source = '';
  }
  for (const forbidden of [
    /\bfetch\s*\(/, /\bXMLHttpRequest\b/, /\bWebSocket\b/, /https?:\/\//,
    /AuthContext|AuthProvider|useAuth|API_ENDPOINTS|API_BASE_URL/, /expo-secure-store|expo-notifications/,
    /HDFC|ICICI|Paytm|State Bank of India|\bSBI\b/i, /linked accounts|connect bank|bank transfer/i,
    /last4|last_4|account_number|card_number/, /\bMOCK_/, /sign in|sign up|sign out|reset password/i,
  ]) assert.equal(forbidden.test(source), false, file + ' contains ' + forbidden);
}
const config = JSON.parse(fs.readFileSync('app.json')).expo;
for (const permission of ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE']) { assert.ok(config.android.permissions.includes(permission)); assert.ok(!config.android.blockedPermissions.includes(permission)); }
const firebase = JSON.parse(fs.readFileSync(config.android.googleServicesFile));
assert.equal(firebase.project_info.project_id, 'stash-ae0d4');
assert.equal(firebase.client.length, 1);
assert.equal(firebase.client[0].client_info.android_client_info.package_name, config.android.package);
const plugin = fs.readFileSync('plugins/withPeraGoOffers.cjs', 'utf8');
assert.ok(plugin.includes("implementation 'com.google.firebase:firebase-config'"));
assert.equal(/firebase-auth|firebase-analytics/.test(plugin), false);
for (const file of files(path.resolve('plugins/showcase')).filter(f => /\.kt$/.test(f))) {
  const native = fs.readFileSync(file, 'utf8');
  assert.equal(/AsyncStorage|stash\.local\.v1|addJavascriptInterface|SslErrorHandler/.test(native), false, file);
}
assert.equal(config.android.allowBackup, false);
assert.equal(config.ios.infoPlist.RCTAsyncStorageExcludeFromBackup, true);
assert.equal(config.updates.enabled, false);
const navigator = fs.readFileSync('src/navigation/AppNavigator.tsx', 'utf8');
assert.ok(navigator.includes('initialRouteName="Home"'));
assert.equal(/Onboarding|Login|Register|ForgotPassword|ProfileScreen|AIAssistant/.test(navigator), false);
for (const file of ['src/services/api.ts', 'src/context/AuthContext.tsx', 'src/screens/profile/ProfileScreen.tsx', 'src/screens/profile/AccountsScreen.tsx']) assert.equal(fs.existsSync(file), false);
console.log('Local financial records, no-auth architecture and native Remote Config configuration checks passed.');
