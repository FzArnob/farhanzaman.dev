<?php
/**
 * The single visitor tracking endpoint.
 *
 * POST JSON:
 *   profile_id, page_tag, feature_tag, activity_tag, action_tag  (required)
 *   screen_resolution, color_depth, timezone_offset, language     (optional)
 */

require_once __DIR__ . '/../lib/Http.php';
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../config/configApp.php';
require_once __DIR__ . '/../models/VisitorModel.php';
require_once __DIR__ . '/../controllers/VisitorController.php';

Http::cors('POST, OPTIONS');
Http::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::error('Error: Method not allowed. Use POST only.', 405);
}

$input = Http::input();

$profile_id = isset($input['profile_id']) ? $input['profile_id'] : PROFILE_ID;
$page_tag = isset($input['page_tag']) ? $input['page_tag'] : null;
$feature_tag = isset($input['feature_tag']) ? $input['feature_tag'] : null;
$activity_tag = isset($input['activity_tag']) ? $input['activity_tag'] : null;
$action_tag = isset($input['action_tag']) ? $input['action_tag'] : null;

if (!$profile_id || !$page_tag || !$feature_tag || !$activity_tag || !$action_tag) {
    Http::error(
        'Error: Required parameters are missing (profile_id, page_tag, feature_tag, activity_tag, action_tag).',
        400
    );
}

// Details the server cannot read from the user agent.
$additionalData = array(
    'screen_resolution' => isset($input['screen_resolution']) ? $input['screen_resolution'] : 'N/A',
    'color_depth' => isset($input['color_depth']) ? $input['color_depth'] : 0,
    'timezone_offset' => isset($input['timezone_offset']) ? $input['timezone_offset'] : 0,
    'language' => isset($input['language']) ? $input['language'] : 'N/A',
);

$conn = Database::connect();
$controller = new VisitorController(new VisitorModel($conn));
$controller->track($profile_id, $page_tag, $feature_tag, $activity_tag, $action_tag, $additionalData);
$conn->close();
