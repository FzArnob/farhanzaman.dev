<?php
require_once __DIR__ . '/../config/configApp.php';

/**
 * Everything that writes to visitor_locations and visitor_tracking.
 * The user agent parsing is carried over unchanged from the 1.06 ProfileModel.
 */
class VisitorModel
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

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
            'mobile_specific_info' => 0
        );

        // Extract browser name and version
        foreach ($browserNames as $browser) {
            if (strpos($userAgent, $browser) !== false) {
                $info['browser_name'] = $browserNamesMap[$browser];
                $info['browser_version'] = $this->getBrowserVersion($userAgent, $browser);
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
        $info['device_details'] = $this->getDeviceManufacturer($userAgent);

        // Extract rendering engine (if available)
        $info['rendering_engine'] = $this->getRenderingEngine($userAgent);
        // Check if rendering engine contains only integers and periods
        if (!preg_match('/^[0-9.]+$/', $info['rendering_engine'])) {
            $info['rendering_engine'] = 'N/A';
        }
        // Extract mobile-specific information (if available)
        if ($info['device_type'] === 'Mobile') {
            $info['mobile_specific_info'] = 1;
        } else $info['mobile_specific_info'] = 0;

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

    // Helper function to generate UUID v7
    function generateUuidV7()
    {
        static $lastUnixMs = null;
        static $sequence = 0;

        // Get current time in milliseconds since the Unix epoch
        $unixMs = (int)(microtime(true) * 1000);

        // Handle potential collisions within the same millisecond
        if ($unixMs === $lastUnixMs) {
            $sequence++;
            $sequence &= 0x3FFF; // Keep within the 14-bit sequence range

            if ($sequence === 0) {
                $unixMs++; // Bump time slightly to avoid collision if sequence overflows
            }
        } else {
            $sequence = random_int(0, 0x3FFF); // Random start for sequence per millisecond
            $lastUnixMs = $unixMs;
        }

        // Extract time components for the UUID structure
        $time_high = ($unixMs >> 16) & 0xFFFFFFFF;
        $time_low = $unixMs & 0xFFFF;

        // Set version (0x7) and variant (0x8) bits
        $time_hi_and_version = ($time_low & 0x0FFF) | (0x7 << 12);
        $clock_seq_hi_and_reserved = ($sequence & 0x3FFF) | 0x8000;

        // Generate 6 bytes (48 bits) of cryptographic randomness for the remaining part
        $randBytes = random_bytes(6);
        $randHex = bin2hex($randBytes);

        // Format and return the UUID v7 string
        return sprintf(
            '%08x-%04x-%04x-%04x-%012s',
            $time_high,
            $time_low,
            $time_hi_and_version,
            $clock_seq_hi_and_reserved,
            $randHex
        );
    }

    /** Calls Geoapify for an IP. Returns null when the lookup fails. */
    private function fetchLocation($ip)
    {
        $api_url = 'https://api.geoapify.com/v1/ipinfo?ip=' . urlencode($ip) . '&apiKey=' . GEOAPIFY_API_KEY;
        $response = @file_get_contents($api_url);
        if ($response === false) {
            return null;
        }

        $data = json_decode($response, true);
        if (!isset($data['country'])) {
            return null;
        }

        return array(
            'continent' => isset($data['continent']['name']) ? $data['continent']['name'] : null,
            'country_name' => isset($data['country']['name']) ? $data['country']['name'] : null,
            'location_latitude' => isset($data['location']['latitude']) ? $data['location']['latitude'] : null,
            'location_longitude' => isset($data['location']['longitude']) ? $data['location']['longitude'] : null,
            'state_name' => isset($data['state']['name']) ? $data['state']['name'] : null,
            'city_name' => isset($data['city']['name']) ? $data['city']['name'] : null,
        );
    }

    /**
     * Makes sure the IP has a row in visitor_locations.
     * A failed lookup still stores the IP with is_tracked = 0; because there is no cron
     * job any more, an untracked IP is retried on a later visit (see LOCATION_RETRY_HOURS).
     * tracked_date doubles as the timestamp of the last lookup attempt.
     */
    function checkAndInsertVisitorLocation($ip)
    {
        $checkQuery = 'SELECT is_tracked, tracked_date FROM visitor_locations WHERE visitor_ip = ?';
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param('s', $ip);
        $stmt->execute();
        $stmt->bind_result($isTracked, $trackedDate);
        $exists = $stmt->fetch();
        $stmt->close();

        if ($exists) {
            if ((int)$isTracked === 1) {
                return true;
            }
            // Retry a previously failed lookup, but not on every single request.
            $retryAfter = time() - (LOCATION_RETRY_HOURS * 3600);
            if ($trackedDate !== null && strtotime($trackedDate) > $retryAfter) {
                return true;
            }
            return $this->updateVisitorLocation($ip);
        }

        return $this->insertVisitorLocation($ip);
    }

    private function insertVisitorLocation($ip)
    {
        $location = $this->fetchLocation($ip);
        $is_tracked = $location ? 1 : 0;
        $tracked_date = date('Y-m-d H:i:s');
        $continent = $location ? $location['continent'] : null;
        $country_name = $location ? $location['country_name'] : null;
        $location_latitude = $location ? $location['location_latitude'] : null;
        $location_longitude = $location ? $location['location_longitude'] : null;
        $state_name = $location ? $location['state_name'] : null;
        $city_name = $location ? $location['city_name'] : null;

        $insertQuery = 'INSERT INTO visitor_locations (visitor_ip, is_tracked, continent, country_name, location_latitude, location_longitude, state_name, city_name, tracked_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        $stmt = $this->conn->prepare($insertQuery);
        $stmt->bind_param('sissdssss', $ip, $is_tracked, $continent, $country_name, $location_latitude, $location_longitude, $state_name, $city_name, $tracked_date);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    private function updateVisitorLocation($ip)
    {
        $location = $this->fetchLocation($ip);
        $is_tracked = $location ? 1 : 0;
        $tracked_date = date('Y-m-d H:i:s');
        $continent = $location ? $location['continent'] : null;
        $country_name = $location ? $location['country_name'] : null;
        $location_latitude = $location ? $location['location_latitude'] : null;
        $location_longitude = $location ? $location['location_longitude'] : null;
        $state_name = $location ? $location['state_name'] : null;
        $city_name = $location ? $location['city_name'] : null;

        $updateQuery = 'UPDATE visitor_locations SET is_tracked = ?, continent = ?, country_name = ?, location_latitude = ?, location_longitude = ?, state_name = ?, city_name = ?, tracked_date = ? WHERE visitor_ip = ?';
        $stmt = $this->conn->prepare($updateQuery);
        $stmt->bind_param('issddssss', $is_tracked, $continent, $country_name, $location_latitude, $location_longitude, $state_name, $city_name, $tracked_date, $ip);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /** Stable per-device id kept in a long lived cookie. */
    function getDeviceFingerprint()
    {
        $cookieName = 'device_fingerprint';

        if (isset($_COOKIE[$cookieName])) {
            return $_COOKIE[$cookieName];
        }

        $newFingerprint = $this->generateUuidV7();
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
        setcookie($cookieName, $newFingerprint, time() + (10 * 365 * 24 * 60 * 60), '/', '', $secure, true);
        return $newFingerprint;
    }

    /** Records one visitor action. */
    public function saveVisitorData($profile_id, $page_tag, $feature_tag, $activity_tag, $action_tag, $additionalData = array())
    {
        $ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
        $referrer_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'N/A';

        // Ensure visitor location exists
        $this->checkAndInsertVisitorLocation($ip);

        // Get user agent data
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        $userAgentData = $this->parseUserAgent($userAgent);

        // Get device fingerprint from cookie
        $device_fingerprint = $this->getDeviceFingerprint();

        // Extract additional data from frontend
        $screen_resolution = isset($additionalData['screen_resolution']) ? $additionalData['screen_resolution'] : 'N/A';
        $color_depth = isset($additionalData['color_depth']) ? intval($additionalData['color_depth']) : 0;
        $timezone_offset = isset($additionalData['timezone_offset']) ? intval($additionalData['timezone_offset']) : 0;
        $language = isset($additionalData['language']) ? $additionalData['language'] : 'N/A';

        $trackingQuery = 'INSERT INTO visitor_tracking (
            device_fingerprint, fk_visitor_ip, browser_name, browser_version,
            operating_system, device_type, screen_resolution, color_depth,
            timezone_offset, language, rendering_engine, page_tag, feature_tag,
            activity_tag, action_tag, referrer_url, fk_profile_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

        $stmt = $this->conn->prepare($trackingQuery);
        $stmt->bind_param(
            'ssssssssissssssss',
            $device_fingerprint,
            $ip,
            $userAgentData['browser_name'],
            $userAgentData['browser_version'],
            $userAgentData['operating_system'],
            $userAgentData['device_type'],
            $screen_resolution,
            $color_depth,
            $timezone_offset,
            $language,
            $userAgentData['rendering_engine'],
            $page_tag,
            $feature_tag,
            $activity_tag,
            $action_tag,
            $referrer_url,
            $profile_id
        );

        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /** Unique visitors by IP, kept from the previous version. */
    public function getVisitorCount($profile_id)
    {
        $query = 'SELECT COUNT(DISTINCT fk_visitor_ip) as count FROM visitor_tracking WHERE fk_profile_id = ?';
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param('s', $profile_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return strval($row['count']);
    }
}
