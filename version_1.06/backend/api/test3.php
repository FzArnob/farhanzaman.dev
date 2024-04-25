<?php
function parseUserAgent($userAgent)
{
    $browserNames = array('OPR/', 'Chrome', 'Firefox', 'Safari', 'Internet Explorer');
    $operatingSystems = array('Windows', 'Macintosh', 'Android', 'iPhone', 'iPod', 'iPad', 'CrOS', 'iOS', '', '', '', '', '', 'Ubuntu', 'Fedora','Linux');
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
        'browser_name' => '',
        'browser_version' => '',
        'operating_system' => '',
        'device_type' => '',
        'device_details' => '',
        'rendering_engine' => '',
        'mobile_specific_info' => ''
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
$userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36 OPR/75.0.3969.285";
print_r(parseUserAgent($userAgent));
?>
