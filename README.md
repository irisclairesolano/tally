# TALLY — Budget Tracker for Filipino Students

A React Native mobile application built with Expo that helps Filipino students track daily income and expenses in Philippine pesos.

## Features

✅ **Bottom Tab Navigation** — Quick access to Home, Transactions, About, and Settings  
✅ **Stack Navigation** — Detailed transaction views with smooth transitions  
✅ **FlatList** — High-performance scrollable transaction lists with filtering  
✅ **Image Assets** — Real images throughout the UI  
✅ **Transaction Tracking** — View income, expenses, and balance at a glance  
✅ **Add Transactions** — Modal-based transaction creation (future feature)  

## Tech Stack

- **Framework:** React Native via Expo (SDK 51+)
- **Navigation:** @react-navigation/native, bottom-tabs, native-stack
- **Icons:** @expo/vector-icons (Ionicons)
- **Language:** JavaScript (no TypeScript)
- **State Management:** Local useState hooks
- **Build Tool:** EAS Build (Expo cloud)

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/irisclairesolano/tally.git
cd tally
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npx expo start
```

Then:
- Press `i` for iOS Simulator (macOS only)
- Press `a` for Android Emulator
- Scan the QR code with Expo Go app on a physical phone

## Project Structure

```
tally/
├── App.js                    # Navigation root (Tab + Stack)
├── app.json                  # Expo config
├── eas.json                  # EAS Build config
├── package.json
├── assets/
│   ├── images/
│   │   ├── members/         # Team member photos
│   │   ├── hero.png
│   │   ├── logo.png
│   │   └── empty.png
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── src/
    ├── theme/               # Design tokens
    ├── data/                # Mock data
    ├── components/          # Reusable UI components
    ├── hooks/               # Custom React hooks
    ├── lib/                 # Utilities & config
    └── screens/             # App screens
```

## Screens

1. **Home** — Dashboard with balance overview and recent transactions
2. **List** — Filtered transaction list (All, Income, Expense)
3. **Details** — Transaction details page (stack-pushed from List)
4. **About** — App description and team member profiles
5. **Settings** — App preferences and info

## Building the APK

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Log in with Expo account
```bash
eas login
```
If you don't have an Expo account, sign up at [https://expo.dev](https://expo.dev)

### Step 3: Configure EAS (first time only)
```bash
eas build:configure
```
Accept the defaults when prompted.

### Step 4: Build the APK
```bash
eas build -p android --profile preview
```

This will:
- Upload your project to Expo's cloud build service
- Compile your React Native code into an Android APK
- Show a build URL after 10-25 minutes

### Step 5: Download the APK
Once the build completes, you'll get a link to download the APK (~30-60 MB). Click it to download.

### Step 6: Install on Android device
```bash
adb install path/to/tally.apk
```

Or simply transfer the APK file to your Android phone and tap it to install.

## Debugging

### If images aren't showing:
- Ensure all image files exist in `assets/images/`
- Check file names match exactly in imports
- Verify image files are under 500 KB each

### If navigation isn't working:
- Check that all screen imports are correct in `App.js`
- Verify screen names match across navigation config and components
- Ensure `@react-navigation` packages are installed: `npm list | grep react-navigation`

### If the app won't start:
```bash
npx expo-doctor
```
This checks for common config issues.

## Project Requirements (Lab Specification)

- ✅ Images — Hero, logo, member photos, empty state
- ✅ Bottom Tab Navigation — 4 tabs in main layout
- ✅ Stack Navigation — ListStack with push/pop to Details
- ✅ FlatList — Scrollable transaction list with filtering
- ✅ Five Screens — Home, List, Details, About, Settings

## Group Members

- **Kyla Chua** — UI / UX Designer
- **Scott Denver Habla** — Lead Developer
- **Iris Claire Solano** — Frontend Developer
- **Cyrene Jane Teodocio** — Documentation Lead

## License

Educational project for Mobile Application Development course.

---

**Questions?** Check the [Expo documentation](https://docs.expo.dev) or the [React Navigation docs](https://reactnavigation.org).
