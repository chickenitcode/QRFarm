# QRFarm APK Build Guide

This guide will help you build an APK file from your QRFarm React Native Expo project.

## Prerequisites

Before building the APK, make sure you have:

1. **Node.js** (version 16 or higher)
2. **Expo CLI** installed globally
3. **EAS CLI** installed globally
4. **Expo account** (free account is sufficient)

## Installation Steps

If you don't have the required tools, install them:

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

## Build Options

### Option 1: Build APK using EAS Build (Recommended)

#### Step 1: Configure the project
Your project is already configured with the updated `eas.json` file.

#### Step 2: Build APK for testing (Preview)
```bash
# Navigate to your project directory
cd "c:\Users\ngocg\OneDrive\Documents\GitHub\QRFarm\src"

# Build preview APK
eas build -p android --profile preview-apk
```

#### Step 3: Build APK for production
```bash
# Build production APK
eas build -p android --profile production-apk
```

#### Step 4: Download the APK
After the build completes:
1. You'll receive a link to download the APK
2. Or check your builds at: https://expo.dev/accounts/[your-username]/projects/QRFarm/builds
3. Download the APK file and install it on your Android device

### Option 2: Build AAB (Android App Bundle) for Play Store

```bash
# Build for Play Store submission (AAB format)
eas build -p android --profile production
```

### Option 3: Local Build (Alternative)

If you want to build locally (requires Android Studio setup):

```bash
# Generate native code
npx expo run:android --variant release

# Or use Expo's legacy build
expo build:android -t apk
```

## Build Profiles Explanation

Your `eas.json` now includes these build profiles:

- **preview-apk**: Creates an APK for internal testing
- **production-apk**: Creates a release APK with optimizations
- **preview**: Creates AAB for internal testing
- **production**: Creates AAB for Play Store

## Build Commands Quick Reference

```bash
# Preview APK (for testing)
eas build -p android --profile preview-apk

# Production APK (for distribution)
eas build -p android --profile production-apk

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

## Troubleshooting

### Common Issues:

1. **"Not logged in"**
   ```bash
   eas login
   ```

2. **"Project not configured"**
   ```bash
   eas build:configure
   ```

3. **Build fails due to dependencies**
   - Make sure all dependencies in `package.json` are properly installed
   - Check for any missing native dependencies

4. **Android package name conflicts**
   - Your package name is set to `com.ngcjang.QRFarm` in `app.json`
   - Make sure this is unique if publishing to Play Store

### Build Environment:

The EAS Build service will:
- Install your dependencies
- Run the build process in a clean environment
- Generate the APK file
- Provide download links

## Testing the APK

1. **Enable Developer Options** on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options
   - Enable "USB Debugging"

2. **Install APK**:
   - Transfer APK to your device
   - Enable "Install from Unknown Sources" if prompted
   - Tap the APK file to install

## Distribution

### For Internal Testing:
- Share the APK file directly
- Use the preview-apk profile for testing builds

### For Play Store:
- Use the production profile (generates AAB)
- Submit through Google Play Console

## Build Time

- First build: 10-20 minutes
- Subsequent builds: 5-15 minutes (depending on changes)

## Cost

- EAS Build includes free build minutes per month
- Check current limits at: https://expo.dev/pricing

## Security Notes

- APKs built with preview profiles may include development tools
- Production builds are optimized and secure for distribution
- Never share debug builds publicly

## Next Steps

After building your APK:

1. Test thoroughly on different Android devices
2. Check app performance and functionality
3. Gather feedback from beta testers
4. Iterate and rebuild as needed
5. Prepare for Play Store submission if desired
