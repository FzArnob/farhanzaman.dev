# YouTube Gaming Videos API Integration

## Setup Instructions

### 1. Get YouTube Data API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Configure the API

1. Open `backend/api/update_gaming_videos.php`
2. Replace `YOUR_YOUTUBE_API_KEY_HERE` on line 13 with your actual YouTube API key:
   ```php
   $this->apiKey = 'your_actual_api_key_here';
   ```

### 3. Set Proper File Permissions

Make sure the following directories are writable:
- `view/js/` (for saving gaming_yt_data.js)

### 4. Test the API

1. Open your gaming page in the browser
2. Click the "🔄 Update Videos" button
3. The system will:
   - Fetch channel data for "runfzrun"
   - Get all uploaded videos (50 per page)
   - Save the data to `view/js/gaming_yt_data.js`
   - Display the videos on the page

## How It Works

### Initial Data Fetch
- When no previous data exists, the API fetches all videos from oldest to newest
- Videos are organized into pages (50 videos per page)
- Each video includes: title, thumbnail, publish date, URL, view count, like count, and type

### Incremental Updates
- When data already exists, the API checks for new videos using the last saved page token
- Only fetches new videos since the last update
- Automatically determines video type (short/full video/stream) based on duration and title

### Data Structure
The generated `gaming_yt_data.js` file contains:
```javascript
{
  channel_name: "Channel Name",
  channel_id: "UC...",
  channel_handle: "runfzrun",
  total_videos: 150,
  total_video_pages: 3,
  max_videos_per_page: 50,
  last_page_total_videos: 0,
  pages: [
    {
      prevPageToken: null,
      pageToken: "...",
      nextPageToken: "...",
      videos: [
        {
          video_title: "...",
          video_thumbnail: "...",
          video_publishTime: "...",
          video_url: "...",
          video_view_count: 1234,
          video_like_count: 56,
          video_type: "full video" // or "short" or "stream"
        }
      ]
    }
  ]
}
```

## Features

### Video Display
- Shows videos in a responsive grid layout
- Displays video thumbnails, titles, publish dates, view counts, and like counts
- Color-coded badges for video types (SHORT, LIVE)
- "Load More" functionality for better performance

### Admin Features
- One-click update button to refresh video data
- Real-time status updates during the fetch process
- Automatic page reload after successful update

### Performance Optimizations
- Caches data in a local JS file to avoid repeated API calls
- Incremental updates to fetch only new videos
- Lazy loading with "Load More" button for large video collections

## Troubleshooting

### Common Issues

1. **"Channel not found" error**
   - Verify the channel handle "runfzrun" is correct
   - Check if the channel exists and is public

2. **API quota exceeded**
   - YouTube Data API has daily quotas
   - Monitor your API usage in Google Cloud Console

3. **File permissions error**
   - Ensure the web server can write to the `view/js/` directory
   - Check file permissions and ownership

4. **CORS errors**
   - The API includes CORS headers for cross-origin requests
   - Ensure your web server supports the required headers

### API Quotas
- Each video costs ~3-4 quota units
- Daily quota limit is usually 10,000 units
- Monitor usage to avoid hitting limits

## Security Notes

- Never expose your API key in client-side code
- Consider implementing IP restrictions on your API key
- Use environment variables for production deployments
- Implement rate limiting to prevent abuse

## Future Enhancements

- Add caching with expiration times
- Implement webhook notifications for new videos
- Add support for multiple channels
- Include video comments and descriptions
- Add search and filtering capabilities
