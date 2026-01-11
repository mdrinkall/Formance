# Formance

**AI-Powered Golf Swing Analysis**

Formance is a cross-platform mobile application that uses AI to analyze your golf swing. Record your swing on your phone, receive instant feedback with visual annotations, personalized coaching tips, YouTube drill recommendations, and a performance score.

## Features

- **AI Swing Analysis** - Upload your swing video and get instant AI-powered feedback using Google Gemini Video Understanding
- **Visual Annotations** - See exactly what needs improvement with frame-by-frame keypoint overlays
- **Personalized Coaching** - Get specific, actionable tips based on your swing mechanics
- **YouTube Drill Library** - Recommended drills with direct links to video tutorials
- **Performance Scoring** - Track your progress with detailed scoring across multiple categories
- **History & Trends** - View past swings and monitor improvement over time
- **Cross-Platform** - Works seamlessly on iOS, Android, and Web

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **AI**: Google Gemini 2.0 Video Understanding API
- **Styling**: Custom design system with golf-green (#1A4D2E) brand
- **State Management**: React Context + Hooks
- **Navigation**: React Navigation

## Project Structure

```
app/
├── components/        # Reusable UI components
│   ├── ui/           # Design system components (Button, Card, Typography)
│   └── layout/       # Layout components (Header, Container)
├── screens/          # App screens organized by feature
├── services/         # Backend integration (Supabase, AI analysis)
├── theme/            # Design tokens (colors, spacing, typography)
├── navigation/       # Navigation configuration
└── utils/            # Helper functions and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Studio

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/formance.git
cd formance
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the development server
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your device

## Key Features Implementation

### AI Analysis Pipeline

1. User records swing video using device camera
2. Video uploaded to Supabase Storage
3. Edge Function calls Google Gemini API for analysis
4. AI returns structured feedback with primary improvement focus
5. Second Edge Function generates visual annotations
6. Results displayed with score, coaching tips, and drill recommendations

### Cross-Platform Design

Built with a mobile-first approach while ensuring web compatibility:
- Responsive layouts using design system spacing tokens
- Platform-specific shadows and interactions
- Accessible touch targets (44×44pt minimum)
- Support for light/dark mode

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Design System

Formance uses a custom design system with:
- **Colors**: Golf-green primary (#1A4D2E) with cream accents (#E9E5D6)
- **Spacing**: 4pt grid system (xs: 4px → massive: 64px)
- **Typography**: Oswald (headers) + Lato (body)
- **Components**: 20+ reusable UI components with consistent styling

## License

MIT

---

Built with React Native, Expo, and Supabase
