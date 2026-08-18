<?php
require_once __DIR__ . '/../config/configApp.php';

/**
 * Rebuilds data/gaming_videos.json from the YouTube Data API.
 * Ported from the 1.06 update_gaming_videos.php; the only change is that the
 * result is written as plain JSON instead of a JavaScript file.
 */
class GamingModel
{
    private $apiKey;
    private $channelHandle;
    private $maxResultsPerPage;
    private $dataFilePath;

    public function __construct()
    {
        $this->apiKey = YOUTUBE_API_KEY;
        $this->channelHandle = YOUTUBE_CHANNEL_HANDLE;
        $this->maxResultsPerPage = YOUTUBE_MAX_RESULTS_PER_PAGE;
        $this->dataFilePath = GAMING_DATA_FILE;
    }

    public function updateVideos()
    {
        try {
            $channelId = $this->getChannelIdFromHandle($this->channelHandle);
            if (!$channelId) {
                throw new Exception('Channel not found');
            }

            $channelData = $this->getChannelData($channelId);
            $uploadsPlaylistId = $channelData['contentDetails']['relatedPlaylists']['uploads'];

            $existingData = $this->loadExistingData();

            if ($existingData) {
                $updatedData = $this->updateExistingData($existingData, $uploadsPlaylistId);
            } else {
                $updatedData = $this->fetchAllVideos($channelData, $uploadsPlaylistId);
            }

            $this->saveToJsonFile($updatedData);

            return array(
                'success' => true,
                'message' => 'Videos updated successfully',
                'total_videos' => $updatedData['total_videos'],
                'total_pages' => count($updatedData['pages']),
            );
        } catch (Exception $e) {
            return array(
                'success' => false,
                'message' => $e->getMessage(),
            );
        }
    }

    private function getChannelIdFromHandle($handle)
    {
        $url = "https://www.googleapis.com/youtube/v3/channels?part=id&forHandle={$handle}&key={$this->apiKey}";
        $response = $this->makeApiCall($url);

        if (!empty($response['items'])) {
            return $response['items'][0]['id'];
        }

        return null;
    }

    private function getChannelData($channelId)
    {
        $url = "https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id={$channelId}&key={$this->apiKey}";
        $response = $this->makeApiCall($url);

        if (!empty($response['items'])) {
            return $response['items'][0];
        }

        throw new Exception('Channel data not found');
    }

    private function loadExistingData()
    {
        if (file_exists($this->dataFilePath)) {
            $content = file_get_contents($this->dataFilePath);
            $data = json_decode($content, true);
            if (is_array($data) && isset($data['pages'])) {
                return $data;
            }
        }
        return null;
    }

    /** Re-fetches from the last known page token onwards and appends anything new. */
    private function updateExistingData($existingData, $uploadsPlaylistId)
    {
        $lastPage = end($existingData['pages']);
        array_pop($existingData['pages']);
        $lastPageToken = isset($lastPage['pageToken']) ? $lastPage['pageToken'] : null;

        $newPages = array();
        $pageToken = $lastPageToken;
        $firstIteration = true;

        while ($pageToken || $firstIteration) {
            $firstIteration = false;

            $videos = $this->getPlaylistVideos($uploadsPlaylistId, $pageToken);

            if (empty($videos['items'])) {
                break;
            }

            $videoDetails = $this->getVideoDetails($videos['items']);

            $newPages[] = array(
                'prevPageToken' => isset($videos['prevPageToken']) ? $videos['prevPageToken'] : null,
                'pageToken' => $pageToken,
                'nextPageToken' => isset($videos['nextPageToken']) ? $videos['nextPageToken'] : null,
                'videos' => $videoDetails,
            );

            $pageToken = isset($videos['nextPageToken']) ? $videos['nextPageToken'] : null;
        }

        $existingData['pages'] = array_merge($existingData['pages'], $newPages);
        $existingData['total_video_pages'] = count($existingData['pages']);

        $totalVideos = 0;
        foreach ($existingData['pages'] as $page) {
            $totalVideos += count($page['videos']);
        }
        $existingData['total_videos'] = $totalVideos;

        $lastPageVideos = end($existingData['pages'])['videos'];
        $existingData['last_page_total_videos'] = count($lastPageVideos);

        return $existingData;
    }

    private function fetchAllVideos($channelData, $uploadsPlaylistId)
    {
        $data = array(
            'channel_name' => $channelData['snippet']['title'],
            'channel_id' => $channelData['id'],
            'channel_handle' => $this->channelHandle,
            'total_videos' => 0,
            'total_video_pages' => 0,
            'max_videos_per_page' => $this->maxResultsPerPage,
            'last_page_total_videos' => 0,
            'pages' => array(),
        );

        $pageToken = null;
        $pageCount = 0;

        do {
            $videos = $this->getPlaylistVideos($uploadsPlaylistId, $pageToken);

            if (empty($videos['items'])) {
                break;
            }

            $videoDetails = $this->getVideoDetails($videos['items']);

            $data['pages'][] = array(
                'prevPageToken' => isset($videos['prevPageToken']) ? $videos['prevPageToken'] : null,
                'pageToken' => $pageToken,
                'nextPageToken' => isset($videos['nextPageToken']) ? $videos['nextPageToken'] : null,
                'videos' => $videoDetails,
            );

            $pageToken = isset($videos['nextPageToken']) ? $videos['nextPageToken'] : null;
            $pageCount++;
        } while ($pageToken);

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

    private function getPlaylistVideos($playlistId, $pageToken = null)
    {
        $url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId={$playlistId}&maxResults={$this->maxResultsPerPage}&key={$this->apiKey}";

        if ($pageToken) {
            $url .= "&pageToken={$pageToken}";
        }

        return $this->makeApiCall($url);
    }

    private function getVideoDetails($playlistItems)
    {
        $videoIds = array_map(function ($item) {
            return $item['snippet']['resourceId']['videoId'];
        }, $playlistItems);

        $videoIdsString = implode(',', $videoIds);
        $url = "https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id={$videoIdsString}&key={$this->apiKey}";

        $response = $this->makeApiCall($url);
        $videos = array();

        foreach ($response['items'] as $video) {
            $duration = $this->parseDuration($video['contentDetails']['duration']);
            $videoType = $this->determineVideoType($duration, $video['snippet']['title']);

            $videos[] = array(
                'video_title' => $video['snippet']['title'],
                'video_thumbnail' => isset($video['snippet']['thumbnails']['high']['url'])
                    ? $video['snippet']['thumbnails']['high']['url']
                    : $video['snippet']['thumbnails']['default']['url'],
                'video_publishTime' => $video['snippet']['publishedAt'],
                'video_url' => 'https://www.youtube.com/watch?v=' . $video['id'],
                'video_view_count' => intval(isset($video['statistics']['viewCount']) ? $video['statistics']['viewCount'] : 0),
                'video_like_count' => intval(isset($video['statistics']['likeCount']) ? $video['statistics']['likeCount'] : 0),
                'video_type' => $videoType,
            );
        }

        return $videos;
    }

    /** ISO 8601 duration (PT4M13S) to seconds. */
    private function parseDuration($duration)
    {
        preg_match('/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/', $duration, $matches);
        $hours = intval(isset($matches[1]) ? $matches[1] : 0);
        $minutes = intval(isset($matches[2]) ? $matches[2] : 0);
        $seconds = intval(isset($matches[3]) ? $matches[3] : 0);

        return $hours * 3600 + $minutes * 60 + $seconds;
    }

    private function determineVideoType($durationSeconds, $title)
    {
        // YouTube Shorts are typically under 60 seconds
        if ($durationSeconds <= 60) {
            return 'short';
        }

        $liveIndicators = array('live', 'stream', 'streaming', 'livestream');
        $titleLower = strtolower($title);

        foreach ($liveIndicators as $indicator) {
            if (strpos($titleLower, $indicator) !== false) {
                return 'stream';
            }
        }

        return 'video';
    }

    private function makeApiCall($url)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new Exception('cURL Error: ' . $error);
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

    private function saveToJsonFile($data)
    {
        $dir = dirname($this->dataFilePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $result = file_put_contents($this->dataFilePath, $json . "\n");

        if ($result === false) {
            throw new Exception('Failed to write ' . $this->dataFilePath);
        }
    }
}
