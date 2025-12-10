# Golf Swing App - Expo + React Native Scaffold

A complete mobile app scaffold for AI-powered golf swing analysis with social features, built with Expo, React Native, TypeScript, NativeWind, and Supabase.

## Features

- 🏌️ AI Swing Capture & Analysis
- 👥 Friend System & Social Features
- ⛳ Score Tracking & Rounds
- 📊 Statistics & Leaderboards
- 🔐 Supabase Authentication
- 💳 Payment Integration Ready
- 🎨 NativeWind (Tailwind CSS) Styling
- 🌓 Light/Dark Mode Support

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio
- Supabase account (for backend)

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Start Development Server

```bash
npm start
# or
yarn start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

## Project Structure

```
/app
  /components      # Reusable UI components
    /ui            # Basic UI elements (Button, Input, Card, etc.)
    /layout        # Layout components (ScreenContainer, Header, etc.)
    /charts        # Chart placeholders
  /constants       # App constants (colors, spacing, etc.)
  /context         # React Context providers (Auth, Theme, User)
  /hooks           # Custom React hooks
  /navigation      # Navigation setup (React Navigation)
  /screens         # All app screens organized by feature
  /services        # Backend services (Supabase, API, etc.)
  /theme           # Design system (colors, typography, spacing)
  /utils           # Utility functions (formatters, validators, etc.)
  /assets          # Images, icons, fonts
```

## Key Technologies

- **Expo** - React Native framework
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native
- **React Navigation** - Routing and navigation
- **Supabase** - Backend (auth, database, storage)
- **Zustand** - State management (optional)

## Development Workflow

### Implementing Features

All screens and services are currently placeholders with TODO comments. To implement a feature:

1. Start with the service layer (`/app/services/`)
2. Update the screen component (`/app/screens/`)
3. Connect to Supabase in the service functions
4. Test the flow end-to-end

### Adding Supabase Tables

1. Create tables in Supabase dashboard
2. Generate TypeScript types: `supabase gen types typescript --project-id your-project-id > app/services/database.types.ts`
3. Update `app/services/supabase.ts` with new types
4. Implement CRUD operations in relevant service files

### Styling with NativeWind

Use Tailwind classes in your components:

```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-900">Hello</Text>
</View>
```

### Navigation

- Auth flow: Onboarding → Login/Signup
- Main app: Tab Navigator (Home, Capture, History, Leaderboard, Profile)
- Modals/Stacks: Analysis, Dashboard, Social, Score, Settings, Payments

## Next Steps (TODOs)

### Backend Setup
- [ ] Create Supabase project
- [ ] Set up database schema (profiles, swings, scores, friends, etc.)
- [ ] Configure authentication providers
- [ ] Set up storage buckets for videos/images

### Authentication
- [ ] Implement Supabase auth in `authService.ts`
- [ ] Connect auth screens to backend
- [ ] Add OAuth providers (Google, Apple)
- [ ] Test auth flow end-to-end

### Core Features
- [ ] Implement camera capture with expo-camera
- [ ] Integrate AI swing analysis API
- [ ] Build score tracking functionality
- [ ] Implement friend system
- [ ] Create leaderboard with real data
- [ ] Add group rounds/meetups

### UI/UX
- [ ] Replace placeholder icons with icon library (Ionicons, etc.)
- [ ] Implement actual charts (Victory Charts or similar)
- [ ] Add loading states and error handling
- [ ] Create custom splash screen and app icon
- [ ] Implement dark mode theming

### Payments
- [ ] Integrate Stripe or RevenueCat
- [ ] Create subscription plans
- [ ] Implement payment flow

## Build for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Contributing

1. Create a feature branch
2. Implement the feature
3. Test thoroughly
4. Submit a pull request

## License

MIT

---

**Note**: This is a scaffold project. All features are placeholders marked with TODO comments. You'll need to implement actual functionality, connect to Supabase, and add business logic.
