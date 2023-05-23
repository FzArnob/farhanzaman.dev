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
    $controller->getProfileData($profile_id);
} else {
    echo "Error: profile_id parameter is missing.";
}

// Close the database connection
$conn->close();
?>
