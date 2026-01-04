# Supabase Edge Functions Setup

This document describes the Supabase Edge Functions implemented for golf swing analysis using Google Gemini AI.

## Overview

Two Edge Functions have been deployed to analyze golf swing videos:

1. **analyze-swing** - Analyzes swing mechanics and returns structured coaching feedback
2. **generate-annotations** - Generates video keyframes and visual annotations

Both functions use Google Gemini Video Understanding API and are secured with JWT authentication.

## Functions Deployed

### 1. analyze-swing

**Purpose**: Analyze golf swing video and return structured coaching feedback with ONE primary improvement focus.

**Endpoint**: `https://twpouulzcwhhxhdilnbj.supabase.co/functions/v1/analyze-swing`

**Input Schema**:
```json
{
  "video_url": "https://example.com/video.mp4",
  "club_used": "5-iron",
  "shot_shape": "straight",
  "user_context": {
    "user_handicap": 18,
    "previous_rankings": [75, 63, 64],
    "previous_goals_summary": "User recently focused on downswing sequencing for 5 days"
  }
}
```

**Output Schema**: See `/mock-responses/analysis.json` for full structure

**Features**:
- Uses Gemini 2.0 Flash Exp model for video understanding
- Uploads video to Gemini File API to avoid memory limits
- Returns overall score, skill level, category breakdowns
- Provides ONE primary focus area for improvement
- Includes recommended drill with YouTube link
- Factors in user context to avoid repeating resolved issues

---

### 2. generate-annotations

**Purpose**: Extract swing keyframes and generate ONE visual annotation reinforcing the primary coaching focus.

**Endpoint**: `https://twpouulzcwhhxhdilnbj.supabase.co/functions/v1/generate-annotations`

**Input Schema**:
```json
{
  "video_url": "https://example.com/video.mp4",
  "primary_focus": "Early Release"
}
```

**Output Schema**: See `/mock-responses/annotations.json` for full structure

**Features**:
- Uses Gemini 2.0 Flash Exp model for video understanding
- Uploads video to Gemini File API to avoid memory limits
- Identifies 7 swing phase keyframes with timestamps
- Generates ONE visual annotation (line type)
- Uses normalized coordinates (0-1 range)
- Annotation reinforces the primary coaching focus

---

## Environment Variables

Both Edge Functions require the Gemini API key to be set as an environment variable:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

This is configured in your Supabase project settings and is NOT exposed to the client.

---

## Testing Locally with curl

### Prerequisites
1. Get your Supabase anon key (for testing):
   - Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3cG91dWx6Y3doaHhoZGlsbmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDkzMDksImV4cCI6MjA4MDg4NTMwOX0.mY6uVeLisfCuqsO9RapO8syVHc2xy4BS5sBIuhXjER0`

2. Get a valid JWT token by logging in as a user first, or use the anon key for testing

### Test analyze-swing

```bash
curl -X POST \
  'https://twpouulzcwhhxhdilnbj.supabase.co/functions/v1/analyze-swing' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "video_url": "https://example.com/golf-swing.mp4",
    "club_used": "driver",
    "shot_shape": "draw",
    "user_context": {
      "user_handicap": 15,
      "previous_rankings": [72, 68, 70],
      "previous_goals_summary": "Working on rotation and weight transfer"
    }
  }'
```

### Test generate-annotations

```bash
curl -X POST \
  'https://twpouulzcwhhxhdilnbj.supabase.co/functions/v1/generate-annotations' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "video_url": "https://example.com/golf-swing.mp4",
    "primary_focus": "Early Release"
  }'
```

---

## How It Works in the App

The `AnalysisLoadingScreen.tsx` has been updated to:

1. Get the user's JWT session token
2. Call `analyze-swing` Edge Function with video URL and context
3. Wait for analysis response with primary_focus
4. Call `generate-annotations` Edge Function with the primary_focus
5. Save both analysis and annotations to Supabase recordings table
6. Navigate to ResultsScreen with the data

### Flow:
```
User uploads video
  → AnalysisLoadingScreen
    → Call analyze-swing (with user context)
    → Get analysis with primary_focus
    → Call generate-annotations (with primary_focus)
    → Save to database
  → Navigate to ResultsScreen
```

---

## Security

- Both functions require JWT authentication (`verify_jwt: true`)
- Gemini API key is stored securely in Supabase environment variables
- API key is NEVER exposed to the client
- All requests are validated for required fields
- Errors return appropriate HTTP status codes (400, 401, 500)

---

## Error Handling

The app includes robust fallback logic:

1. If Edge Functions fail, it falls back to mock data
2. If annotations fail, it uses mock annotations
3. All errors are logged for debugging
4. User always sees results (either real or mock)

---

## Cost Management

Both functions use Gemini 2.0 Flash Exp which is:
- Fast and efficient for video understanding
- Cost-effective for production use
- Capable of analyzing video content holistically

**Important**: Monitor your Gemini API usage to avoid unexpected costs.

---

## Memory Optimization

Both Edge Functions have been optimized to handle video files efficiently:

1. **Video Upload Strategy**: Instead of loading entire videos into memory and converting to base64, the functions now:
   - Download the video and save it to a temporary file
   - Upload the file to Gemini's File API
   - Reference the uploaded file by URI for analysis
   - Clean up both temp files and uploaded files after processing

2. **Benefits**:
   - Avoids Edge Function memory limits (150MB)
   - Handles larger video files (up to Gemini's limits)
   - More efficient processing
   - Better error handling

3. **Processing Flow**:
   ```
   Video URL → Download to /tmp → Upload to Gemini File API → Wait for processing → Analyze → Cleanup
   ```

## Future Improvements

- [ ] Fetch actual user handicap from profile
- [ ] Get previous rankings from recording history
- [ ] Store and retrieve previous goals summary
- [ ] Add caching for repeated analysis (cache Gemini file uploads)
- [ ] Implement rate limiting
- [ ] Add webhooks for async processing of longer videos
- [ ] Optimize video download (streaming instead of full download)

---

## Troubleshooting

### Function returns 401 Unauthorized
- Ensure you're passing a valid JWT token in the Authorization header
- Check that your session hasn't expired

### Function returns 500 Internal Server Error
- Check that GEMINI_API_KEY is set in Supabase project settings
- Verify the video URL is accessible and publicly downloadable
- Check function logs in Supabase dashboard
- Ensure the video file size is reasonable (< 50MB recommended)

### Memory limit exceeded error (FIXED)
- **This has been fixed** by using Gemini's File API instead of base64 encoding
- If you still see this error, check:
  - Video file size (very large files may still cause issues)
  - Supabase Edge Function timeout settings
  - Function logs for specific error details

### Analysis takes too long
- Video processing can take 10-30 seconds depending on length
- Consider implementing async processing for videos > 30 seconds

### Invalid video format
- Ensure video is in a supported format (MP4, MOV, etc.)
- Gemini supports most common video formats
- Video should be < 50MB for optimal performance

---

## Viewing Logs

To view function logs in Supabase:

1. Go to Supabase Dashboard → Edge Functions
2. Click on the function name
3. View logs tab for request/response details

Or use the Supabase CLI:
```bash
supabase functions logs analyze-swing
supabase functions logs generate-annotations
```

---

## Questions?

For issues or questions about the Edge Functions implementation, check:
- Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Gemini Video Understanding: https://ai.google.dev/gemini-api/docs/video-understanding
- Function source code in this repository
