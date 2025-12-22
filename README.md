# Tin Tức VN - Complete Installation Guide

## 📦 All Required Files

Here's the complete file structure you need to create:

```
TinTucVN/
├── config/
│   └── firebase.ts
├── src/
│   ├── components/
│   │   └── SeedDatabaseButton.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── Main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ArticleDetailScreen.tsx
│   │   │   ├── SearchScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── SavedArticlesScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── SplashScreen.tsx
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── seedFirebase.ts
├── App.tsx
├── app.json
└── package.json
```

## 🚀 Step-by-Step Installation

### Step 1: Create Project

```bash
npx create-expo-app@latest TinTucVN --template expo-template-blank-typescript
cd TinTucVN
```

### Step 2: Install All Dependencies

```bash
# Navigation
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# Firebase
npm install firebase

# UI & Icons
npm install @expo/vector-icons

# Storage
npx expo install @react-native-async-storage/async-storage

# Fonts
npx expo install expo-font @expo-google-fonts/playfair-display @expo-google-fonts/inter

# HTML Rendering
npm install react-native-render-html

# OAuth & Web Browser
npx expo install expo-web-browser expo-auth-session

# Install all in one go:
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-font @expo-google-fonts/playfair-display @expo-google-fonts/inter expo-web-browser expo-auth-session && npm install firebase @expo/vector-icons react-native-render-html
```

### Step 3: Create Directory Structure

```bash
mkdir -p config
mkdir -p src/{components,contexts,navigation,screens/{Auth,Main},types,utils}
```

### Step 4: Copy All Files

Copy each file I provided into the correct location:

1. **config/firebase.ts** - Firebase configuration
2. **src/types/index.ts** - TypeScript types
3. **src/contexts/AuthContext.tsx** - Authentication context
4. **src/navigation/AppNavigator.tsx** - Navigation setup
5. **src/utils/seedFirebase.ts** - Database seeding utility
6. **src/components/SeedDatabaseButton.tsx** - Seed button component
7. **src/screens/SplashScreen.tsx** - Splash screen
8. **src/screens/Auth/LoginScreen.tsx** - Login screen
9. **src/screens/Auth/RegisterScreen.tsx** - Register screen
10. **src/screens/Main/HomeScreen.tsx** - Home screen
11. **src/screens/Main/ArticleDetailScreen.tsx** - Article detail screen
12. **src/screens/Main/SearchScreen.tsx** - Search screen
13. **src/screens/Main/ProfileScreen.tsx** - Profile screen
14. **src/screens/Main/SavedArticlesScreen.tsx** - Saved articles screen
15. **src/screens/Main/SettingsScreen.tsx** - Settings screen
16. **App.tsx** - Main app component

### Step 5: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project "TinTucVN"
3. Add a Web App
4. Copy your Firebase config
5. Update `config/firebase.ts` with your credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### Step 6: Enable Firebase Services

In Firebase Console:

1. **Authentication**

   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

2. **Firestore Database**

   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose a location

3. **Security Rules** (Firestore > Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /articles/{articleId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 7: Configure OAuth (Google Sign-In)

1. Get your Web Client ID from Firebase Console > Authentication > Sign-in method > Google
2. Update `src/contexts/AuthContext.tsx`:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  expoClientId: "YOUR_EXPO_CLIENT_ID.apps.googleusercontent.com",
  androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
});
```

### Step 8: Update app.json

```json
{
  "expo": {
    "name": "TinTucVN",
    "slug": "tintucvn",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.tintucvn"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.tintucvn"
    }
  }
}
```

### Step 9: Run the App

```bash
# Start Expo
npx expo start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Press 'w' for web browser
# Or scan QR code with Expo Go app
```

### Step 10: Seed the Database

1. Create a test admin account in Firebase Console > Authentication

   - Email: admin@news.vn
   - Password: admin123
   - Add custom claim: `role: "admin"` (in Firestore users collection)

2. Login to the app with admin account
3. Go to Settings screen
4. Click "Thêm dữ liệu mẫu" button
5. Wait for seeding to complete

## 🎨 Features Included

- ✅ Firebase Authentication (Email & Google)
- ✅ Firestore Database Integration
- ✅ Article Browse by Category
- ✅ Search Functionality
- ✅ Save/Bookmark Articles
- ✅ User Profile
- ✅ Settings Screen
- ✅ Database Seeding Tool
- ✅ Responsive Mobile Design
- ✅ TypeScript Support

## 🐛 Common Issues & Solutions

### Issue: "Expo modules not found"

```bash
npx expo install --fix
```

### Issue: Firebase connection errors

- Check your firebaseConfig credentials
- Ensure you're connected to the internet
- Verify Firestore security rules

### Issue: Google Sign-In not working

- Verify all OAuth client IDs are correct
- For Android: Add SHA-1 fingerprint to Firebase
- For iOS: Download and add GoogleService-Info.plist

### Issue: Fonts not loading

```bash
npx expo start -c
```

### Issue: Navigation errors

Make sure all screens are imported in AppNavigator.tsx

## 📱 Testing Accounts

After seeding, create these accounts in Firebase Console:

**Admin Account:**

- Email: admin@news.vn
- Password: admin123
- Role: admin (in Firestore)

**User Account:**

- Email: user@news.vn
- Password: user123
- Role: user (in Firestore)

## 🔄 Next Steps

1. ✅ Customize the app colors/theme
2. ✅ Add more article categories
3. ✅ Implement comments feature
4. ✅ Add push notifications
5. ✅ Implement admin dashboard
6. ✅ Add offline mode
7. ✅ Optimize images
8. ✅ Add analytics

## 📞 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Firebase is configured correctly
4. Check that all files are in the correct directories

## 🎉 You're Done!

Your app should now be running with:

- User authentication
- Article browsing
- Search functionality
- Saved articles
- Profile management
- Database seeding tool

Happy coding! 🚀
