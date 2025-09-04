<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class YouTubeVideoUpdater {
    private $apiKey;
    private $channelHandle = 'runfzrun';
    private $maxResultsPerPage = 50;
    private $jsFilePath;
    
    public function __construct() {
        // You need to set your YouTube Data API key here
        $this->apiKey = 'AIzaSyCQz_ezpdhnVLlLD1jMKU4HRh4pDSe_8pY'; // Replace with your actual API key
        $this->jsFilePath = __DIR__ . '/../../view/js/gaming_yt_data.js';
    }
    
    public function updateVideos() {
        try {
            // Get channel ID from handle
            $channelId = $this->getChannelIdFromHandle($this->channelHandle);
            if (!$channelId) {
                throw new Exception('Channel not found');
            }
            
            // Get channel details
            $channelData = $this->getChannelData($channelId);
            
            // Get uploads playlist ID
            $uploadsPlaylistId = $channelData['contentDetails']['relatedPlaylists']['uploads'];
            
            // Check if existing data exists
            $existingData = $this->loadExistingData();
            
            if ($existingData) {
                // Update existing data
                $updatedData = $this->updateExistingData($existingData, $uploadsPlaylistId);
            } else {
                // Fetch all data from scratch
                $updatedData = $this->fetchAllVideos($channelData, $uploadsPlaylistId);
            }
            
            // Save to JS file
            $this->saveToJSFile($updatedData);
            
            return [
                'success' => true,
                'message' => 'Videos updated successfully',
                'total_videos' => $updatedData['total_videos'],
                'total_pages' => count($updatedData['pages'])
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    private function getChannelIdFromHandle($handle) {
        $url = "https://www.googleapis.com/youtube/v3/channels?part=id&forHandle={$handle}&key={$this->apiKey}";
        $response = $this->makeApiCall($url);
        
        if (!empty($response['items'])) {
            return $response['items'][0]['id'];
        }
        
        return null;
    }
    
    private function getChannelData($channelId) {
        $url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id={$channelId}&key={$this->apiKey}";
        $response = $this->makeApiCall($url);
        
        if (!empty($response['items'])) {
            return $response['items'][0];
        }
        
        throw new Exception('Channel data not found');
    }
    
    private function loadExistingData() {
        if (file_exists($this->jsFilePath)) {
            $content = file_get_contents($this->jsFilePath);
            // Extract JSON from JS file
            preg_match('/const gamingYouTubeData = (.*?);$/ms', $content, $matches);
            if (!empty($matches[1])) {
                return json_decode($matches[1], true);
            }
        }
        return null;
    }
    
    private function updateExistingData($existingData, $uploadsPlaylistId) {
        // Get the last page's nextPageToken
        $lastPage = end($existingData['pages']);
        $lastPageToken = $lastPage['nextPageToken'] ?? null;
        
        if (!$lastPageToken) {
            // No more videos to fetch
            return $existingData;
        }
        
        // Fetch new videos starting from the last page token
        $newPages = [];
        $pageToken = $lastPageToken;
        
        while ($pageToken) {
            $videos = $this->getPlaylistVideos($uploadsPlaylistId, $pageToken);
            
            if (empty($videos['items'])) {
                break;
            }
            
            $videoDetails = $this->getVideoDetails($videos['items']);
            
            $newPages[] = [
                'prevPageToken' => $videos['prevPageToken'] ?? null,
                'pageToken' => $pageToken,
                'nextPageToken' => $videos['nextPageToken'] ?? null,
                'videos' => $videoDetails
            ];
            
            $pageToken = $videos['nextPageToken'] ?? null;
        }
        
        // Merge new pages with existing data
        $existingData['pages'] = array_merge($existingData['pages'], $newPages);
        $existingData['total_video_pages'] = count($existingData['pages']);
        
        // Recalculate totals
        $totalVideos = 0;
        foreach ($existingData['pages'] as $page) {
            $totalVideos += count($page['videos']);
        }
        $existingData['total_videos'] = $totalVideos;
        
        // Update last page total videos
        $lastPageVideos = end($existingData['pages'])['videos'];
        $existingData['last_page_total_videos'] = count($lastPageVideos);
        
        return $existingData;
    }
    
    private function fetchAllVideos($channelData, $uploadsPlaylistId) {
        $data = [
            'channel_name' => $channelData['snippet']['title'],
            'channel_id' => $channelData['id'],
            'channel_handle' => $this->channelHandle,
            'total_videos' => 0,
            'total_video_pages' => 0,
            'max_videos_per_page' => $this->maxResultsPerPage,
            'last_page_total_videos' => 0,
            'pages' => []
        ];
        
        $pageToken = null;
        $pageCount = 0;
        
        do {
            $videos = $this->getPlaylistVideos($uploadsPlaylistId, $pageToken);
            
            if (empty($videos['items'])) {
                break;
            }
            
            $videoDetails = $this->getVideoDetails($videos['items']);
            
            $data['pages'][] = [
                'prevPageToken' => $videos['prevPageToken'] ?? null,
                'pageToken' => $pageToken,
                'nextPageToken' => $videos['nextPageToken'] ?? null,
                'videos' => $videoDetails
            ];
            
            $pageToken = $videos['nextPageToken'] ?? null;
            $pageCount++;
            
        } while ($pageToken);
        
        // Calculate totals
        $totalVideos = 0;
        foreach ($data['pages'] as $page) {
            $totalVideos += count($page['videos']);
        }
        
        $data['total_videos'] = $totalVideos;
        $data['total_video_pages'] = $pageCount;
        
        if (!empty($data['pages'])) {
            $lastPageVideos = end($data['pages'])['videos'];
            $data['last_page_total_videos'] = count($lastPageVideos);
        }
        
        return $data;
    }
    
    private function getPlaylistVideos($playlistId, $pageToken = null) {
        $url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={$playlistId}&maxResults={$this->maxResultsPerPage}&key={$this->apiKey}";
        
        if ($pageToken) {
            $url .= "&pageToken={$pageToken}";
        }
        
        return $this->makeApiCall($url);
    }
    
    private function getVideoDetails($playlistItems) {
        $videoIds = array_map(function($item) {
            return $item['snippet']['resourceId']['videoId'];
        }, $playlistItems);
        
        $videoIdsString = implode(',', $videoIds);
        $url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={$videoIdsString}&key={$this->apiKey}";
        
        $response = $this->makeApiCall($url);
        $videos = [];
        
        foreach ($response['items'] as $video) {
            $duration = $this->parseDuration($video['contentDetails']['duration']);
            $videoType = $this->determineVideoType($duration, $video['snippet']['title']);
            
            $videos[] = [
                'video_title' => $video['snippet']['title'],
                'video_thumbnail' => $video['snippet']['thumbnails']['high']['url'] ?? $video['snippet']['thumbnails']['default']['url'],
                'video_publishTime' => $video['snippet']['publishedAt'],
                'video_url' => "https://www.youtube.com/watch?v=" . $video['id'],
                'video_view_count' => intval($video['statistics']['viewCount'] ?? 0),
                'video_like_count' => intval($video['statistics']['likeCount'] ?? 0),
                'video_type' => $videoType
            ];
        }
        
        return $videos;
    }
    
    private function parseDuration($duration) {
        // Parse ISO 8601 duration format (PT4M13S = 4 minutes 13 seconds)
        preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $duration, $matches);
        $hours = intval($matches[1] ?? 0);
        $minutes = intval($matches[2] ?? 0);
        $seconds = intval($matches[3] ?? 0);
        
        return $hours * 3600 + $minutes * 60 + $seconds;
    }
    
    private function determineVideoType($durationSeconds, $title) {
        // YouTube Shorts are typically under 60 seconds
        if ($durationSeconds <= 60) {
            return 'short';
        }
        
        // Check for live stream indicators in title
        $liveIndicators = ['live', 'stream', 'streaming', 'livestream'];
        $titleLower = strtolower($title);
        
        foreach ($liveIndicators as $indicator) {
            if (strpos($titleLower, $indicator) !== false) {
                return 'stream';
            }
        }
        
        return 'full video';
    }
    
    private function makeApiCall($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            throw new Exception('cURL Error: ' . curl_error($ch));
        }
        
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("API request failed with status code: {$httpCode}");
        }
        
        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response');
        }
        
        return $data;
    }
    
    private function saveToJSFile($data) {
        $jsContent = "// Gaming YouTube Data - Generated automatically\n";
        $jsContent .= "// Last updated: " . date('Y-m-d H:i:s') . "\n\n";
        $jsContent .= "const gamingYouTubeData = " . json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . ";\n\n";
        $jsContent .= "// Export for use in other files\n";
        $jsContent .= "if (typeof module !== 'undefined' && module.exports) {\n";
        $jsContent .= "    module.exports = gamingYouTubeData;\n";
        $jsContent .= "}\n";
        
        // Ensure directory exists
        $dir = dirname($this->jsFilePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        $result = file_put_contents($this->jsFilePath, $jsContent);
        
        if ($result === false) {
            throw new Exception('Failed to write JS file');
        }
    }
}

// Handle the request
if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'POST') {
    $updater = new YouTubeVideoUpdater();
    $result = $updater->updateVideos();
    echo json_encode($result, JSON_PRETTY_PRINT);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
