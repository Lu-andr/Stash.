# PeraGo — local tracker with configured financial offers
PeraGo records manually entered wallets, income, expenses, budget limits, recurring entries and savings goals on the device. Android also reads financial-offer configuration from Firebase Remote Config (project stash-ae0d4, registration app.stash). It has no user registration, bank connection, payment processing or cloud synchronization of the financial ledger. The native offers module cannot read the ledger. The app is no longer completely offline.

## Run
Use Node 22 and Java 21. In mobile:
- npm ci
- npm test
- npm run check:local
- npx tsc --noEmit
- npx expo prebuild --platform android --no-install
- cd android && ./gradlew testReleaseUnitTest assembleRelease -PreactNativeArchitectures=arm64-v8a

The release is standalone; it does not use a development server. Android Internet permissions are enabled for Remote Config and offer pages; automatic backup remains disabled. The iOS AsyncStorage backup exclusion is explicitly enabled.

## Local data
AsyncStorage persists a versioned snapshot under stash.local.v1. Writes are serialized. The UI receives a new immutable snapshot only after a successful write. Failed reads do not overwrite existing data; failed writes leave existing data and UI unchanged.

New installations start with Cash, Main Wallet and Savings with zero balances, generic categories and an empty ledger. The previous prototype did not persist its sample ledger; fabricated sample balances and transactions are not imported.

Wallets have only a name, generic type/icon, currency and initial balance. Their displayed balances are derived from recorded transactions. Editing or deleting an operation recalculates balances; currencies are never added together or converted. A wallet's currency cannot change while it has transactions. Deleting a wallet retains those transactions in history with their original currency; an edit then requires an active wallet of that currency.

Reports, budget totals and category rules use locally recorded data. Category rules apply only to new entries marked Other. No exchange rates or personalized financial advice are provided. Settings, categories, budgets, rules, recurring entries and savings goals persist in the same local snapshot.

Data is not synchronized or backed up by this app. Uninstalling or clearing application data removes these records. Treat device access and device backups according to the platform's own settings. The app does not promise encryption or biometric locking.

## Google Play
Describe actual manual tracking functionality accurately in the listing, privacy policy, Data safety and Financial features declarations. Offline storage and neutral wording do not exempt an app from Google's declarations or guarantee approval.

## Validation
The Android workflow runs local-storage integration tests, Kotlin offer routing/parser tests, source checks, TypeScript compilation, native generation and a release APK build. It also inspects the merged release manifest for network permissions and backup settings. Device UI testing should be reported separately from these automated checks.

## Android startup offers
This follows Lu-andr/Stash_MY_CEX at f90e4c9273fbf53e9b3f2a0402359178ff07fae3. Firebase keys are task_validator (boolean), app_data (JSON country/locale), and settings (JSON offers/fallbackOffers/countries).

When task_validator is true and offers exist, the first offer after featured/priority/rating ordering opens directly. openMode external uses the device browser; other modes use the internal WebView. If the first link is blank or invalid, the offer list is shown. Disabled configuration, an empty list or a first-launch fetch failure leaves the local tracker available. A fetch is bounded by a six-second startup timeout; late results apply on the next launch and cannot interrupt an open finance form. Firebase's previously activated values can be used after a failed fetch, as in the source project.

Country offers take priority over country fallbackOffers, then global offers and global fallbackOffers. Translations are selected from app_data.locale with the device language as fallback. Remote Config defaults contain no offers and task_validator is false. Firebase Auth and Analytics are not included. Existing Firebase conditions based on Analytics user properties/audiences require separate configuration and are outside this integration.

The Kotlin sources and Gradle/manifest integration live under mobile/plugins/showcase and mobile/plugins/withPeraGoOffers.cjs, so expo prebuild reproduces them. Android native generated sources are not committed. The launcher name, icon, light/dark preference, package app.stash and storage key stash.local.v1 are preserved. This Android integration does not configure Firebase for iOS.
