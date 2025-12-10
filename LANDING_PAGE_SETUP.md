# Landing Page Setup Instructions

## ✅ What's Been Created

Your Formance landing page has been built with:

- **Modern Glass-Morphism Design** - Apple iOS-style with blur effects
- **Premium Aesthetic** - Dark royal British green (#1A4D2E) and cream beige (#E9E5D6)
- **Responsive Layout** - Works on all mobile screen sizes
- **Smooth Animations** - Touch interactions with visual feedback
- **Gradient Overlays** - For text readability

## 📦 Required Steps

### 1. Install New Dependencies

In your PowerShell (as Administrator):

```powershell
cd D:\!!Dev\Formance
npm install
```

This will install:
- `expo-linear-gradient` - For gradient overlays
- `expo-blur` - For glass-morphism effect

### 2. Add Background Image

**Find or create a golf course sunset image:**
- Recommended size: 1170x2532px (iPhone 14 Pro Max) or similar
- Format: JPG
- Content: Green golf course at sunset/golden hour
- Quality: High resolution for best results

**Add the image:**
1. Save your image as `landing-page.jpg`
2. Place it in: `D:\!!Dev\Formance\app\assets\images\landing-page.jpg`
3. Update the code in `OnboardingScreen.tsx`:
   - Change `const hasImage = false;` to `const hasImage = true;`

**For now:**
- The app uses a beautiful green gradient background as a fallback
- It still looks premium and matches the brand colors

### 3. Restart Expo

```powershell
# Stop the current server (Ctrl+C)
npm start
```

## 🎨 Design Specifications

### Colors
- **Primary**: Dark Royal British Green `#1A4D2E`
- **Secondary**: Cream Beige `#E9E5D6`
- **Text**: White with subtle shadows for depth

### Typography
- **Title**: 56px, Bold, White
- **Subtitle**: 24px, Light, Cream
- **Button**: 18px, Semibold, Dark Green

### Glass Button Effect
- Semi-transparent cream background
- Blur intensity: 80
- Rounded corners: 28px
- Subtle white border
- Dark green shadow for depth

## 🔄 Current Screen Flow

1. **App Loads** → Onboarding/Welcome Screen (what we just built)
2. **User Taps "Get Started"** → Currently logs to console
3. **Next Step**: Wire up navigation to Login screen

## 📱 How to Test

1. Start the app: `npm start`
2. Scan QR code with Expo Go
3. You'll see the Welcome screen with:
   - "Welcome to Formance" title (top-left)
   - Glass-morphism "Get Started" button (bottom-center)
   - Beautiful gradient or golf course background

## 🎯 Next Steps

To complete the onboarding flow, you can:

1. Add the golf course image for the full visual impact
2. Connect "Get Started" button to navigate to Login screen
3. Add multiple onboarding slides if desired
4. Add animations/transitions between screens

## 🐛 Troubleshooting

**If you get errors about BlurView or LinearGradient:**
- Make sure you ran `npm install`
- Restart Expo dev server
- Clear cache: `npx expo start --clear`

**If the image doesn't show:**
- Verify the image path is correct
- Ensure the image is named `landing-page.jpg` (exact name)
- Check that `hasImage` is set to `true`

---

**Your landing page is ready to impress! 🎉**
