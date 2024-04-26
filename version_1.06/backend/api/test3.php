<?php
function parseUserAgent($userAgent)
{
    $browserNames = array('OPR/', 'MiuiBrowser/', 'HuaweiBrowser/', 'VivoBrowser/', 'HeyTapBrowser/', 'Silk/', 'Edge/', 'Presto/', 'EdgA/', 'SamsungBrowser/', 'UCBrowser/', 'Brave/', 'Vivaldi/', 'YaBrowser/', 'Discord/', 'Twitter-', 'LinkedIn/', 'Snapchat/', 'Pinterest/', 'WhatsApp/', 'Instagram ', 'FBAV/', 'FBAN/', 'FB_IAB/', 'FB4A/', 'FBIOS/', 'Chrome/', 'Firefox/', 'Safari/');
    $operatingSystems = array('Windows', 'Macintosh', 'Windows Phone', 'BBE', 'Android', 'iPhone', 'iPod', 'iPad', 'CrOS', 'iOS', 'CentOS', 'RHEL', 'FreeBSD', 'PlayStation', 'Ubuntu', 'Fedora', 'Linux');
    $browserNamesMap = array(
        'OPR/' => 'Opera Browser',
        'MiuiBrowser/' => 'Mi Browser',
        'HuaweiBrowser/' => 'Huawei Browser',
        'VivoBrowser/' => 'Vivo Browser',
        'HeyTapBrowser/' => 'HeyTap Browser',
        'Silk/' => 'Amazon Silk',
        'Edge/' => 'Microsoft Edge',
        'Presto/' => 'Opera (Old)',
        'EdgA/' => 'Microsoft Edge (Android)',
        'SamsungBrowser/' => 'Samsung Browser',
        'UCBrowser/' => 'UC Browser',
        'Brave/' => 'Brave Browser',
        'Vivaldi/' => 'Vivaldi Browser',
        'YaBrowser/' => 'Yandex Browser',
        'Discord/' => 'Discord',
        'Twitter-' => 'Twitter',
        'LinkedIn/' => 'LinkedIn',
        'Snapchat/' => 'Snapchat',
        'Pinterest/' => 'Pinterest',
        'WhatsApp/' => 'WhatsApp',
        'Instagram ' => 'Instagram',
        'FBAV/' => 'Facebook (Android)',
        'FBAN/' => 'Facebook (iOS)',
        'FB_IAB/' => 'Facebook (In-App Browser)',
        'FB4A/' => 'Facebook (Android)',
        'FBIOS/' => 'Facebook (iOS)',
        'Chrome/' => 'Google Chrome',
        'Firefox/' => 'Mozilla Firefox',
        'Safari/' => 'Safari'
    );

    $operatingSystemsMap = array(
        'Windows' => 'Microsoft Windows',
        'Macintosh' => 'Mac OS',
        'Windows Phone' => 'Windows Phone',
        'BBE' => 'BlackBerry OS',
        'Android' => 'Android',
        'iPhone' => 'iOS (iPhone)',
        'iPod' => 'iOS (iPod)',
        'iPad' => 'iOS (iPad)',
        'CrOS' => 'Chrome OS',
        'iOS' => 'iOS',
        'CentOS' => 'CentOS',
        'RHEL' => 'Red Hat Enterprise Linux',
        'FreeBSD' => 'FreeBSD',
        'PlayStation' => 'PlayStation OS',
        'Ubuntu' => 'Ubuntu',
        'Fedora' => 'Fedora',
        'Linux' => 'Linux'
    );

    $deviceTypes = array(
        'Console' => array('PlayStation', 'Xbox', 'Nintendo'),
        'Wearable' => array('SmartWatch', 'Wearable'),
        'Bot' => array('bot', 'spider', 'crawl', 'googlebot'),
        'SmartTV' => array('SMART-TV', 'CrKey/', 'Silk/', 'Dalvik/', 'SmartTV', 'Smart TV', 'BRAVIA'),
        'Tablet' => array('iPad', 'Touch', 'SM-', 'Surface', 'Lenovo TB', 'MatePad', 'KFMEWI', 'KFSUWI', 'Pixel Slate', 'Asus_Z', 'Sony SG', 'Mi Pad', 'Venue', 'Acer B', 'HP Elite', 'LG-V', 'Alcatel_', 'Toughbook', 'Fujitsu Q', 'Toshiba AT', 'Archos Oxygen', 'Wacom Cintiq', 'Xoom', 'PlayBook', 'ASUS Transformer', 'HTC Flyer', 'Grand X', 'ViewPad', 'Multipad', 'Nextbook', 'Onda V', 'Ramos', 'Pipo', 'Tablet'),
        'Mobile' => array('iPhone', 'Android', 'Windows Phone', 'BBE', 'Mobile'),
        'Desktop' => array('Windows', 'Macintosh', 'Linux', 'X11', 'CrOS', 'Ubuntu', 'Fedora')
    );

    $info = array(
        'browser_name' => 'Other',
        'browser_version' => 'N/A',
        'operating_system' => 'Other',
        'device_type' => 'Other',
        'device_details' => 'N/A',
        'rendering_engine' => 'N/A',
        'mobile_specific_info' => 'false'
    );

    // Extract browser name and version
    foreach ($browserNames as $browser) {
        if (strpos($userAgent, $browser) !== false) {
            $info['browser_name'] = $browserNamesMap[$browser];
            $info['browser_version'] = getBrowserVersion($userAgent, $browser);
            break;
        }
    }

    // Extract operating system
    foreach ($operatingSystems as $os) {
        if (strpos($userAgent, $os) !== false) {
            $info['operating_system'] = $operatingSystemsMap[$os];
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
        $info['mobile_specific_info'] = 'true';
    } else $info['mobile_specific_info'] = 'false';

    return $info;
}


// Helper function to extract browser version
function getBrowserVersion($userAgent, $browser)
{
    $startPos = strpos($userAgent, $browser) + strlen($browser) + 1;
    $endPos = strpos($userAgent . ' ', ' ', $startPos);
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

$userAgent = "Mozilla/5.0 ";
print_r(parseUserAgent($userAgent));
