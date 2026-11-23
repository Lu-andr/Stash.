# Stash — local personal tracker
Stash records manually entered wallets, income, expenses, budget limits, recurring entries and savings goals on the device. It has no registration, server, bank connections, real payments, lending, cloud synchronization, telemetry or remote assistant.

## Run
Use Node 22 and Java 21. In mobile:
- npm ci
- npm test
- npm run check:offline
- npx tsc --noEmit
- npx expo prebuild --platform android --no-install
- cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a

The release is standalone; it does not use a development server. Android Internet permissions and automatic backup are disabled. The iOS AsyncStorage backup exclusion is explicitly enabled.

## Local data
AsyncStorage persists a versioned snapshot under stash.local.v1. Writes are serialized. The UI receives a new immutable snapshot only after a successful write. Failed reads do not overwrite existing data; failed writes leave existing data and UI unchanged.

New installations start with Cash, Main Wallet and Savings with zero balances, generic categories and an empty ledger. The previous prototype did not persist its sample ledger; fabricated sample balances and transactions are not imported.

Wallets have only a name, generic type/icon, currency and initial balance. Their displayed balances are derived from recorded transactions. Editing or deleting an operation recalculates balances; currencies are never added together or converted. A wallet's currency cannot change while it has transactions. Deleting a wallet retains those transactions in history with their original currency; an edit then requires an active wallet of that currency.

Reports, budget totals and category rules use locally recorded data. Category rules apply only to new entries marked Other. No exchange rates or personalized financial advice are provided. Settings, categories, budgets, rules, recurring entries and savings goals persist in the same local snapshot.

Data is not synchronized or backed up by this app. Uninstalling or clearing application data removes these records. Treat device access and device backups according to the platform's own settings. The app does not promise encryption or biometric locking.

## Google Play
Describe actual manual tracking functionality accurately in the listing, privacy policy, Data safety and Financial features declarations. Offline storage and neutral wording do not exempt an app from Google's declarations or guarantee approval.

## Validation
The Android workflow runs offline storage integration tests, source checks, TypeScript compilation, native generation and a release APK build. It also inspects the merged release manifest for network permissions and backup settings. Device UI testing should be reported separately from these automated checks.
