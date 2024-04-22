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

$profile_id = 'farhan';
$controller->updateProfileData($profile_id);

// Close the database connection
$conn->close();
?>
