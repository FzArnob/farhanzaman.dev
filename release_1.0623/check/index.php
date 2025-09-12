<?php
require_once '../backend/models/ProfileModel.php';
require_once '../backend/config/configDatabase.php';

function parseUserAgent($userAgent)
{
    $browserNames = array('Chrome', 'Firefox', 'Safari', 'Internet Explorer');
    $operatingSystems = array('Windows', 'Macintosh', 'Linux', 'iOS', 'Android');
    $deviceTypes = array(
        'Desktop' => array('Windows', 'Macintosh', 'Linux', 'X11', 'CrOS'),
        'Mobile' => array('iPhone', 'Android', 'Windows Phone', 'BlackBerry', 'Mobile'),
        'Tablet' => array('iPad', 'Android', 'Tablet'),
        'SmartTV' => array('SMART-TV'),
        'Console' => array('PlayStation', 'Xbox', 'Nintendo'),
        'Wearable' => array('SmartWatch', 'Wearable'),
        'Bot' => array('bot', 'spider', 'crawl', 'googlebot')
    );

    $info = array(
        'server_status' => '<span style="color: #00c58a;">Online</span>',
        'request_time' => gmdate('Y-m-d H:i:s', time()),
        'browser_name' => '',
        'browser_version' => '',
        'operating_system' => '',
        'device_type' => '',
        'device_details' => '',
        'rendering_engine' => '',
        'mobile_specific_info' => '',
        'user_ip' => $_SERVER['REMOTE_ADDR']
    );

    // Extract browser name and version
    foreach ($browserNames as $browser) {
        if (strpos($userAgent, $browser) !== false) {
            $info['browser_name'] = $browser;
            $info['browser_version'] = getBrowserVersion($userAgent, $browser);
            break;
        }
    }

    // Extract operating system
    foreach ($operatingSystems as $os) {
        if (strpos($userAgent, $os) !== false) {
            $info['operating_system'] = $os;
            break;
        }
    }

    // Extract device type
    foreach ($deviceTypes as $device => $keywords) {
        foreach ($keywords as $keyword) {
            if (stripos($userAgent, $keyword) !== false) {
                $info['device_type'] = $device;
                break 2; // Break both loops
            }
        }
    }

    // Extract device details (formerly DeviceManufacturer)
    $info['device_details'] = getDeviceManufacturer($userAgent);

    // Extract rendering engine (if available)
    $info['rendering_engine'] = getRenderingEngine($userAgent);

    // Extract mobile-specific information (if available)
    if ($info['device_type'] === 'Mobile') {
        $info['mobile_specific_info'] = getMobileSpecificInfo($userAgent);
    }

    return $info;
}


// Helper function to extract browser version
function getBrowserVersion($userAgent, $browser)
{
    $startPos = strpos($userAgent, $browser) + strlen($browser) + 1;
    $endPos = strpos($userAgent, ' ', $startPos);
    $version = substr($userAgent, $startPos, $endPos - $startPos);
    return $version;
}

// Helper function to extract device manufacturer
function getDeviceManufacturer($userAgent)
{
    $startPos = strpos($userAgent, '(') + 1;
    $endPos = strpos($userAgent, ')', $startPos);
    $manufacturer = substr($userAgent, $startPos, $endPos - $startPos);
    return $manufacturer;
}

// Helper function to extract rendering engine
function getRenderingEngine($userAgent)
{
    $startPos = strpos($userAgent, 'AppleWebKit/') + strlen('AppleWebKit/');
    $endPos = strpos($userAgent, ' ', $startPos);
    $engine = substr($userAgent, $startPos, $endPos - $startPos);
    return $engine;
}

// Helper function to extract mobile-specific information
function getMobileSpecificInfo($userAgent)
{
    $info = '';
    if (strpos($userAgent, 'Mobile') !== false) {
        // Extract additional mobile-specific info, such as screen resolution or pixel density
        // Modify this section as per your requirements
        $info = 'Some mobile-specific information';
    }
    return $info;
}
// Database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$model = new ProfileModel($conn);

$userAgent = $_SERVER['HTTP_USER_AGENT'];
$result = parseUserAgent($userAgent);

?>
<!DOCTYPE html>
<html>

<head>
    <title>Check farhanzaman.dev</title>
    <link href="https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/view/static/favicon.png" rel="icon" />
</head>

<body style="padding: 0; margin: 0;">
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; color: white; background-color: #333; font-family: Arial, sans-serif;">
        <div style="padding: 40px; border-radius: 10px; background-color: #555;">
            <h1>farhanzaman.dev - 185.27.134.60</h1>
            <?php
            // Output the result
            echo implode(' ', array_map(function ($key, $value) {
                $formattedKey = ucwords(str_replace('_', ' ', $key));
                return '<p>' . $formattedKey . ': ' . $value . '</p>';
            }, array_keys($result), $result));
            echo '<p> Visitor Count: ' . $model->getVisitorCount('farhan') . ' </p>'
            ?>
        </div>
    </div>
</body>

</html>