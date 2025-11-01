# Shopping List App - Setup & Deployment Guide

## 🚀 Project Overview

A collaborative shopping list app built with Ionic Angular, Firebase, and NgRx Signals. Features real-time synchronization, offline support, and PWA capabilities.

## 📋 Features

- ✅ User authentication (Email/Password)
- ✅ Group-based shopping lists
- ✅ Real-time synchronization
- ✅ Offline support with IndexedDB persistence
- ✅ PWA ready (Add to Home Screen)
- ✅ Cross-platform (Web, iOS, Android)
- ✅ Modern Angular with Signals and standalone components
- ✅ State management with NgRx Signals

## 🔧 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ionic CLI (`npm install -g @ionic/cli`)
- Firebase account
- Android Studio (for Android builds)
- Xcode (for iOS builds - Mac only)

## 🛠️ Initial Setup

### 1. Firebase Configuration

1. **Create Firebase Project:**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name (e.g., "shopping-list-app")
   - Enable Google Analytics (optional)

2. **Enable Authentication:**

   - Navigate to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Optionally enable Google provider

3. **Create Firestore Database:**

   - Navigate to Firestore Database
   - Click "Create database"
   - Choose "Start in test mode" (we'll add security rules later)
   - Select your preferred location

4. **Get Firebase Config:**

   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click "Web" icon to add web app
   - Register app with nickname
   - Copy the config object

5. **Update Environment Files:**
   Replace the placeholder values in:

   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`

   ```typescript
   export const environment = {
     production: false, // true for prod
     firebase: {
       apiKey: 'your-actual-api-key',
       authDomain: 'your-project-id.firebaseapp.com',
       projectId: 'your-actual-project-id',
       storageBucket: 'your-project-id.appspot.com',
       messagingSenderId: 'your-actual-sender-id',
       appId: 'your-actual-app-id',
     },
   };
   ```

### 2. Deploy Firestore Security Rules

1. **Install Firebase CLI:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize:**

   ```bash
   firebase login
   firebase init firestore
   ```

   - Select your Firebase project
   - Use the existing `firestore.rules` file

3. **Deploy Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

## 🚀 Development

### Run Development Server

```bash
ionic serve
```

### Build for Production

```bash
ionic build --prod
```

## 📱 Mobile App Deployment

### Android Deployment

1. **Build and Copy:**

   ```bash
   ionic build --prod
   ionic capacitor copy android
   ionic capacitor open android
   ```

2. **In Android Studio:**
   - Build > Generate Signed Bundle/APK
   - Follow the signing process
   - Deploy to Google Play Store

### iOS Deployment (Requires Mac)

1. **Build and Copy:**

   ```bash
   ionic build --prod
   ionic capacitor copy ios
   ionic capacitor open ios
   ```

2. **In Xcode:**
   - Configure signing & capabilities
   - Archive and upload to App Store Connect

### Cloud-based iOS Build (Alternative)

Use **Ionic Appflow** or **Codemagic**:

1. **Ionic Appflow:**

   - Push code to GitHub/GitLab
   - Connect to Ionic Appflow
   - Configure iOS certificates
   - Build in the cloud

2. **Codemagic:**
   - Connect your repository
   - Configure build workflow
   - Add iOS certificates
   - Build and deploy

## 🌐 PWA Deployment

### Firebase Hosting

1. **Initialize Hosting:**

   ```bash
   firebase init hosting
   ```

   - Select your project
   - Public directory: `www`
   - Single-page app: Yes
   - Auto builds and deploys: Optional

2. **Build and Deploy:**
   ```bash
   ionic build --prod
   firebase deploy --only hosting
   ```

### Alternative Hosting Platforms

**Netlify:**

1. Build the project: `ionic build --prod`
2. Drag and drop the `www` folder to Netlify
3. Configure redirects for SPA

**Vercel:**

1. Install Vercel CLI: `npm install -g vercel`
2. Build the project: `ionic build --prod`
3. Deploy: `vercel --cwd www`

## 📱 Testing the PWA

### On Mobile Devices

**iPhone (Safari):**

1. Open the app URL in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

**Android (Chrome):**

1. Open the app URL in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"

## 🔐 Security Considerations

1. **Environment Variables:**

   - Never commit real Firebase config to public repos
   - Use environment variables in production

2. **Firestore Rules:**

   - The included rules ensure only authenticated users can access data
   - Only group members can access group data

3. **Authentication:**
   - Implement proper error handling
   - Consider adding email verification
   - Add password reset functionality

## 🎯 Usage Flow

1. **User Registration/Login:**

   - Users sign up with email/password
   - Automatic redirect to groups page

2. **Group Management:**

   - Create new groups or join existing ones
   - Share group ID with other members

3. **List Management:**

   - Create shopping lists within groups
   - All group members can see and edit lists

4. **Item Management:**
   - Add items with quantities
   - Check off completed items
   - Add items to cart
   - Real-time updates for all users

## 🛠️ Customization Options

### Styling

- Modify `src/theme/variables.scss` for global theming
- Update individual component styles
- Add custom CSS classes

### Features

- Add item categories
- Implement barcode scanning
- Add price tracking
- Include store locations
- Add push notifications

### Integrations

- Google Maps for store locations
- Payment gateways for cost splitting
- Product APIs for suggestions

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Errors:**

   - Verify environment configuration
   - Check internet connectivity
   - Confirm Firebase project status

2. **Build Errors:**

   - Clear node_modules: `rm -rf node_modules && npm install`
   - Clear Ionic cache: `ionic capacitor clean`

3. **PWA Installation Issues:**
   - Ensure HTTPS (required for PWA)
   - Check manifest.json validity
   - Verify service worker registration

### Support

- Check Ionic documentation
- Firebase documentation
- Community forums and Stack Overflow

## 📄 License

This project is open source and available under the MIT License.
