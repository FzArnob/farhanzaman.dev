<?php
/**
 * Contact form endpoint.
 *
 * POST (form encoded or JSON): profile_id, name, email, subject, message
 */

require_once __DIR__ . '/../lib/Http.php';
require_once __DIR__ . '/../lib/Database.php';
require_once __DIR__ . '/../config/configApp.php';
require_once __DIR__ . '/../models/MessageModel.php';
require_once __DIR__ . '/../controllers/MessageController.php';

Http::cors('POST, OPTIONS');
Http::handlePreflight();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Http::error('Error: Method not allowed. Use POST only.', 405);
}

$input = Http::input();

$profileId = isset($input['profile_id']) ? $input['profile_id'] : PROFILE_ID;
$name = isset($input['name']) ? trim($input['name']) : '';
$email = isset($input['email']) ? trim($input['email']) : '';
$subject = isset($input['subject']) ? trim($input['subject']) : '';
$message = isset($input['message']) ? trim($input['message']) : '';

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    Http::error('Name, email, subject, message is mandatory.', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    Http::error('Invalid email address', 400);
}

$conn = Database::connect();
$controller = new MessageController(new MessageModel($conn));
$controller->send($profileId, $name, $email, $subject, $message);
$conn->close();
