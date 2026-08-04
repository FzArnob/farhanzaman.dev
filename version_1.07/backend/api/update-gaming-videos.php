<?php
/**
 * Refreshes data/gaming_videos.json from the YouTube Data API.
 *
 * GET or POST. When UPDATE_TOKEN is configured, pass it as ?token=... or an
 * X-Update-Token header. Touches no database table.
 */

require_once __DIR__ . '/../lib/Http.php';
require_once __DIR__ . '/../config/configApp.php';
require_once __DIR__ . '/../models/GamingModel.php';
require_once __DIR__ . '/../controllers/GamingController.php';

Http::cors('GET, POST, OPTIONS');
Http::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::error('Error: Method not allowed. Use GET or POST.', 405);
}

if (UPDATE_TOKEN !== '') {
    $provided = isset($_GET['token'])
        ? $_GET['token']
        : (isset($_SERVER['HTTP_X_UPDATE_TOKEN']) ? $_SERVER['HTTP_X_UPDATE_TOKEN'] : '');
    if (!hash_equals(UPDATE_TOKEN, $provided)) {
        Http::error('Error: Invalid update token.', 403);
    }
}

$controller = new GamingController(new GamingModel());
$controller->refresh();
