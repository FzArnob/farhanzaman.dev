<?php
class ProfileModel
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

    function checkAndInsertVisitorLocation($ip)
    {
        // Check if visitor location with the same IP already exists
        $checkQuery = "SELECT visitor_ip FROM visitor_locations WHERE visitor_ip = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $ip);
        $stmt->execute();
        $stmt->store_result();
        
        if ($stmt->num_rows > 0) {
            // IP already exists in visitor_locations
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            // IP does not exist, fetch geo info and insert new visitor location
            $api_url = "https://api.geoapify.com/v1/ipinfo?ip=$ip&apiKey=b8568cb9afc64fad861a69edbddb2658";
            $response = file_get_contents($api_url);
            $data = json_decode($response, true);

            // Check if the API call was successful
            $is_tracked = 0;
            $continent = null;
            $country_name = null;
            $location_latitude = null;
            $location_longitude = null;
            $state_name = null;
            $city_name = null;
            $tracked_date = null;

            if ($response !== false && isset($data["country"])) {
                $is_tracked = 1;
                $tracked_date = date('Y-m-d H:i:s');
                $continent = isset($data["continent"]["name"]) ? $data["continent"]["name"] : null;
                $country_name = isset($data["country"]["name"]) ? $data["country"]["name"] : null;
                $location_latitude = isset($data["location"]["latitude"]) ? $data["location"]["latitude"] : null;
                $location_longitude = isset($data["location"]["longitude"]) ? $data["location"]["longitude"] : null;
                $state_name = isset($data["state"]["name"]) ? $data["state"]["name"] : null;
                $city_name = isset($data["city"]["name"]) ? $data["city"]["name"] : null;
            }

            $insertQuery = "INSERT INTO visitor_locations (visitor_ip, is_tracked, continent, country_name, location_latitude, location_longitude, state_name, city_name, tracked_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conn->prepare($insertQuery);
            $stmt->bind_param("sissdssss", $ip, $is_tracked, $continent, $country_name, $location_latitude, $location_longitude, $state_name, $city_name, $tracked_date);
            
            if ($stmt->execute()) {
                $stmt->close();
                return true;
            } else {
                $stmt->close();
                return false;
            }
        }
    }

    function getDeviceFingerprint() 
    {
        $cookieName = "device_fingerprint";

        if (isset($_COOKIE[$cookieName])) {
            // Already has device fingerprint
            return $_COOKIE[$cookieName];
        } else {
            // Generate new device fingerprint using UUID v7
            $newFingerprint = $this->generateUuidV7();
            setcookie($cookieName, $newFingerprint, time() + (10 * 365 * 24 * 60 * 60), "/", "", true, true);
            return $newFingerprint;
        }
    }

    public function saveVisitorData($profile_id, $page_tag, $feature_tag, $activity_tag, $action_tag, $additionalData = [])
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $referrer_url = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'N/A';
        
        // Ensure visitor location exists
        $this->checkAndInsertVisitorLocation($ip);
        
        // Get user agent data
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $userAgentData = $this->parseUserAgent($userAgent);
        
        // Get device fingerprint from cookie
        $device_fingerprint = $this->getDeviceFingerprint();
        
        // Extract additional data from frontend
        $screen_resolution = isset($additionalData['screen_resolution']) ? $additionalData['screen_resolution'] : 'N/A';
        $color_depth = isset($additionalData['color_depth']) ? intval($additionalData['color_depth']) : 0;
        $timezone_offset = isset($additionalData['timezone_offset']) ? intval($additionalData['timezone_offset']) : 0;
        $language = isset($additionalData['language']) ? $additionalData['language'] : 'N/A';
        
        // Insert visitor tracking data
        $trackingQuery = "INSERT INTO visitor_tracking (
            device_fingerprint, fk_visitor_ip, browser_name, browser_version, 
            operating_system, device_type, screen_resolution, color_depth, 
            timezone_offset, language, rendering_engine, page_tag, feature_tag, 
            activity_tag, action_tag, referrer_url, fk_profile_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($trackingQuery);
        $stmt->bind_param(
            "ssssssssissssssss",
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
        
        if ($stmt->execute()) {
            $stmt->close();
            return true;
        } else {
            $stmt->close();
            return false;
        }
    }


    public function getProfileData($profile_id)
    {
        $result = array();

        // Fetch profile information
        $query = "SELECT * FROM profile_info WHERE profile_id = '$profile_id'";
        $profile_info_result = $this->conn->query($query);
        if ($profile_info_result) {
            $profile_info = $profile_info_result->fetch_assoc();
            $profile_info['designations'] = explode(",", $profile_info['designations']);
            $result['profile']['info'] = $profile_info;
        } else {
            $result['profile']['info'] = array();
        }

        // Fetch education items
        $query = "SELECT * FROM education_items WHERE fk_profile_id = '$profile_id'";
        $education_items_result = $this->conn->query($query);
        if ($education_items_result) {
            $education_items = $education_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['educations'] = $education_items;
        } else {
            $result['profile']['educations'] = array();
        }

        // Fetch experience items
        $query = "SELECT * FROM experience_items WHERE fk_profile_id = '$profile_id'";
        $experience_items_result = $this->conn->query($query);
        if ($experience_items_result) {
            $experience_items = $experience_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['experiences'] = $experience_items;
        } else {
            $result['profile']['experiences'] = array();
        }

        // Fetch expertise items
        $query = "SELECT * FROM expertise_items WHERE fk_profile_id = '$profile_id'";
        $expertise_items_result = $this->conn->query($query);
        if ($expertise_items_result) {
            $expertise_items = $expertise_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['expertises'] = $expertise_items;
        } else {
            $result['profile']['expertises'] = array();
        }

        // Fetch skill items
        $query = "SELECT * FROM skill_items WHERE fk_profile_id = '$profile_id'";
        $skill_items_result = $this->conn->query($query);
        if ($skill_items_result) {
            $skill_items = $skill_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['skills'] = $skill_items;
        } else {
            $result['profile']['skills'] = array();
        }

        // Fetch achievement items
        $query = "SELECT * FROM achievement_items WHERE fk_profile_id = '$profile_id'";
        $achievement_items_result = $this->conn->query($query);
        if ($achievement_items_result) {
            $achievement_items = $achievement_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['achievements'] = $achievement_items;
        } else {
            $result['profile']['achievements'] = array();
        }

        // Fetch projects
        $query = "SELECT * FROM projects WHERE fk_profile_id = '$profile_id'";
        $projects_result = $this->conn->query($query);
        if ($projects_result) {
            $projects = $projects_result->fetch_all(MYSQLI_ASSOC);

            // Iterate through each project to fetch associated media
            foreach ($projects as &$project) {
                $project_id = $project['project_id'];

                // Fetch media data for the current project
                $media_query = "SELECT * FROM project_media WHERE project_id = '$project_id'";
                $media_result = $this->conn->query($media_query);

                if ($media_result) {
                    $media = $media_result->fetch_all(MYSQLI_ASSOC);
                    $project['media'] = $media;
                } else {
                    $project['media'] = array();
                }
            }

            $result['profile']['projects'] = $projects;
        } else {
            $result['profile']['projects'] = array();
        }


        // Fetch gallery items
        $query = "SELECT * FROM gallery_items WHERE fk_profile_id = '$profile_id'";
        $gallery_items_result = $this->conn->query($query);
        if ($gallery_items_result) {
            $gallery_items = $gallery_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['gallery'] = $gallery_items;
        } else {
            $result['profile']['gallery'] = array();
        }

        return $result;
    }


    public function getVisitorCount($profile_id)
    {
        // Fetch unique visitor count based on unique IPs for the profile
        $query = "SELECT COUNT(DISTINCT fk_visitor_ip) as count FROM visitor_tracking 
                  WHERE fk_profile_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $profile_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return strval($row['count']);
    }
    public function sendDirectMessage($profileId, $name, $email, $subject, $message)
    {
        $result = array();
        $stmt = $this->conn->prepare("INSERT INTO direct_messages (name, email, subject, message, fk_profile_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $name, $email, $subject, $message, $profileId);

        if ($stmt->execute()) {
            // Data inserted successfully
            $data = array();
            $data["id"] = $stmt->insert_id;
            $data["name"] = $name;
            $data["email"] = $email;
            $data["subject"] = $subject;

            http_response_code(200);
            $result["message"] = "Success: add";
            $result["data"] = $data;
        } else {
            // Failed to insert data
            http_response_code(500);
            $result["message"] = "Error: " . $stmt->error;
        }

        $stmt->close();
        return $result;
    }
}
