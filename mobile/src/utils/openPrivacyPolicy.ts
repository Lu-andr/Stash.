import { Alert, Linking } from 'react-native';
import { PRIVACY_POLICY_URL } from '../constants/legal';

// User-initiated handoff to the device browser. No financial data leaves the app.
export async function openPrivacyPolicy() {
  try {
    await Linking.openURL(PRIVACY_POLICY_URL);
  } catch {
    Alert.alert('Could not open Privacy Policy', 'Please check that a web browser is installed and try again.');
  }
}
