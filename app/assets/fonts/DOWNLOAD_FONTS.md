# Download Required Fonts

## Fonts Needed

### 1. Oswald (For Headers/Logos)
- **Bold** variant
- **Regular** variant

### 2. Lato (For Body Text)
- **Regular** variant
- **Light** variant

## How to Download

### Option 1: Google Fonts (Recommended)

1. **Download Oswald:**
   - Go to: https://fonts.google.com/specimen/Oswald
   - Click "Download family"
   - Extract the zip file
   - Copy these files to `D:\!!Dev\Formance\app\assets\fonts\`:
     - `Oswald-Bold.ttf`
     - `Oswald-Regular.ttf`

2. **Download Lato:**
   - Go to: https://fonts.google.com/specimen/Lato
   - Click "Download family"
   - Extract the zip file
   - Copy these files to `D:\!!Dev\Formance\app\assets\fonts\`:
     - `Lato-Regular.ttf`
     - `Lato-Light.ttf`

### Option 2: Direct Links

**Oswald:**
- https://github.com/google/fonts/raw/main/ofl/oswald/Oswald%5Bwght%5D.ttf

**Lato:**
- https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf
- https://github.com/google/fonts/raw/main/ofl/lato/Lato-Light.ttf

## File Structure

After downloading, your folder should look like:

```
app/assets/fonts/
├── Oswald-Bold.ttf
├── Oswald-Regular.ttf
├── Lato-Regular.ttf
└── Lato-Light.ttf
```

## After Adding Fonts

1. Make sure all 4 font files are in the `fonts` folder
2. Run in PowerShell:
   ```powershell
   cd D:\!!Dev\Formance
   npm install
   npm start
   ```
3. Reload the app (press `r` in Expo terminal or shake device)

The fonts will load automatically!
