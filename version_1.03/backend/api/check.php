<?php
// Set the response content type to JSON
header('Content-Type: application/json');

// Get the device information from the request headers
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$device_type = getDeviceType($user_agent);
$ip = $_SERVER['REMOTE_ADDR'];
// Define the response array
$response = array(
    'message' => 'User Info',
    'device_type' => $device_type,
    'ip' => $ip,
    
);

// Convert the response array to JSON
$json_response = json_encode($response);

// Output the JSON response
echo $json_response;

// Function to determine the device type based on the user agent string
function getDeviceType($user_agent) {
    $tablet_devices = array(
        'iPad',
        'AndroidTablet'
    );

    $mobile_devices = array(
        'iPhone',
        'AndroidMobile'
    );

    if (preg_match('/' . implode('|', $tablet_devices) . '/i', $user_agent)) {
        return 'Tablet';
    } elseif (preg_match('/' . implode('|', $mobile_devices) . '/i', $user_agent)) {
        return 'Mobile';
    } else {
        return 'Desktop';
    }
}
?>
