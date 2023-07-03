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

// Process the request
if (isset($_GET['profile_id'])) {
    $profile_id = $_GET['profile_id'];
    $controller->getGalleryData($profile_id);
} else {
    http_response_code(400);
    $result["message"] = "Error: profile_id parameter is missing.";
    $errorJson = json_encode($result);

    // Return the JSON response
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
    header('Content-Type: application/json');
    echo $errorJson;
}

// Close the database connection
$conn->close();
?>
