<?php
// Application level configuration.

// The profile every visitor action and message is attributed to.
define('PROFILE_ID', getenv('PROFILE_ID') ?: 'farhan');

// Shared data folder served by the frontend as /data.
define('DATA_DIR', __DIR__ . '/../../data');
define('GAMING_DATA_FILE', DATA_DIR . '/gaming_videos.json');

// IP geolocation used to fill visitor_locations.
define('GEOAPIFY_API_KEY', getenv('GEOAPIFY_API_KEY') ?: 'b8568cb9afc64fad861a69edbddb2658');

// YouTube Data API, used by update-gaming-videos.php.
define('YOUTUBE_API_KEY', getenv('YOUTUBE_API_KEY') ?: 'AIzaSyCQz_ezpdhnVLlLD1jMKU4HRh4pDSe_8pY');
define('YOUTUBE_CHANNEL_HANDLE', getenv('YOUTUBE_CHANNEL_HANDLE') ?: 'runfzrun');
define('YOUTUBE_MAX_RESULTS_PER_PAGE', 50);

// Shared secret for the gaming refresh endpoint. Leave empty to disable the check.
define('UPDATE_TOKEN', getenv('UPDATE_TOKEN') ?: '');

// A location lookup that failed is retried after this many hours instead of by a cron job.
define('LOCATION_RETRY_HOURS', 24);
