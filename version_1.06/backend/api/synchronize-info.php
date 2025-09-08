<?php
// Include necessary files
require_once '../config/configDatabase.php';
require_once '../models/ProfileModel.php';
require_once '../controllers/ProfileController.php';

// Database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create the model and controller instances
$model = new ProfileModel($conn);
$controller = new ProfileController($model);

// Handle POST requests only
$requestMethod = $_SERVER['REQUEST_METHOD'];

if ($requestMethod === 'POST') {
    // Handle POST request with JSON data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Required parameters
    $profile_id = isset($input['profile_id']) ? $input['profile_id'] : null;
    $page_tag = isset($input['page_tag']) ? $input['page_tag'] : null;
    $feature_tag = isset($input['feature_tag']) ? $input['feature_tag'] : null;
    $activity_tag = isset($input['activity_tag']) ? $input['activity_tag'] : null;
    $action_tag = isset($input['action_tag']) ? $input['action_tag'] : null;
    
    // Additional data from frontend
    $additionalData = array();
    if (isset($input['screen_resolution'])) {
        $additionalData['screen_resolution'] = $input['screen_resolution'];
    }
    if (isset($input['color_depth'])) {
        $additionalData['color_depth'] = $input['color_depth'];
    }
    if (isset($input['timezone_offset'])) {
        $additionalData['timezone_offset'] = $input['timezone_offset'];
    }
    if (isset($input['language'])) {
        $additionalData['language'] = $input['language'];
    }
    
    // Validate required parameters
    if ($profile_id && $page_tag && $activity_tag && $action_tag) {
        $controller->synchronizeInfo($profile_id, $page_tag, $feature_tag, $activity_tag, $action_tag, $additionalData);
    } else {
        http_response_code(400);
        $result["success"] = false;
        $result["message"] = "Error: Required parameters are missing (profile_id, page_tag, activity_tag, action_tag).";
        $errorJson = json_encode($result);

        // Return the JSON response
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Content-Type: application/json');
        echo $errorJson;
    }
} else {
    // Method not allowed
    http_response_code(405);
    $result["success"] = false;
    $result["message"] = "Error: Method not allowed. Use POST only.";
    $errorJson = json_encode($result);

    // Return the JSON response
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Content-Type: application/json');
    echo $errorJson;
}

// Close the database connection
$conn->close();
?>
