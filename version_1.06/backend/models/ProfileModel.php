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
            'mobile_specific_info' => 'false'
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

    function checkAndGetVisitorId($profile_id, $ip)
    {
        // Check if visitor with the same IP already exists
        $checkQuery = "SELECT visitor_id FROM visitors WHERE visitor_ip = ?";
        $stmt = $this->conn->prepare($checkQuery);
        $stmt->bind_param("s", $ip);
        $stmt->execute();
        $stmt->store_result();
        $visitor_id = 0;
        if ($stmt->num_rows > 0) {
            // Visitor already exists, get the visitor_id
            $stmt->bind_result($visitor_id);
            $stmt->fetch();
            // Visitor already exists, get the visitor_id
            $stmt->bind_result($visitor_id);
            $stmt->fetch();
            $stmt->close();

            // Update the updated_date for the existing visitor
            $updateQuery = "UPDATE visitors SET updated_date = NOW() WHERE visitor_id = ?";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bind_param("i", $visitor_id);
            $updateStmt->execute();
            $updateStmt->close();
        } else {
            // Visitor does not exist, fetch geo info and insert new visitor
            $api_url = "https://api.geoapify.com/v1/ipinfo?ip=$ip&apiKey=b8568cb9afc64fad861a69edbddb2658";
            $response = file_get_contents($api_url);
            $data = json_decode($response, true);

            // Check if the API call was successful
            $is_tracked = false;
            if ($response !== false && isset($data["continent"])) {
                $is_tracked = true;
            }


            $insertQuery = "INSERT INTO visitors (visitor_ip, is_tracked, continent, country_iso_code, country_phone_code, country_name, country_currency, location_latitude, location_longitude, subdivisions_name, state_name, city_name, fk_profile_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conn->prepare($insertQuery);

            $continentName = isset($data["continent"]["name"]) ? $data["continent"]["name"] : null;
            $countryIsoCode = isset($data["country"]["iso_code"]) ? $data["country"]["iso_code"] : null;
            $countryPhoneCode = isset($data["country"]["phone_code"]) ? $data["country"]["phone_code"] : null;
            $countryName = isset($data["country"]["name"]) ? $data["country"]["name"] : null;
            $countryCurrency = isset($data["country"]["currency"]) ? $data["country"]["currency"] : null;
            $locationLatitude = isset($data["location"]["latitude"]) ? $data["location"]["latitude"] : null;
            $locationLongitude = isset($data["location"]["longitude"]) ? $data["location"]["longitude"] : null;
            $subdivisionsName = isset($data["subdivisions"][0]["names"]["en"]) ? $data["subdivisions"][0]["names"]["en"] : null;
            $stateName = isset($data["state"]["name"]) ? $data["state"]["name"] : null;
            $cityName = isset($data["city"]["names"]["en"]) ? $data["city"]["names"]["en"] : null;

            $stmt->bind_param(
                "sisssssddssss",
                $ip,
                $is_tracked,
                $continentName,
                $countryIsoCode,
                $countryPhoneCode,
                $countryName,
                $countryCurrency,
                $locationLatitude,
                $locationLongitude,
                $subdivisionsName,
                $stateName,
                $cityName,
                $profile_id
            );

            $stmt->execute();
            // Get the visitor_id of the newly inserted visitor
            $visitor_id = $stmt->insert_id;
            $stmt->close();
        }
        return $visitor_id;
    }

    function insertNewSession($visitor_session_id, $visitor_id)
    {
        // Get the current timestamp
        $currentTimestamp = date('Y-m-d H:i:s');
        // Calculate end time as start time + 1 day
        $endTime = date('Y-m-d H:i:s', strtotime($currentTimestamp . ' + 1 day'));
        $action_points = 1;
        // Insert new session into visitor_sessions table
        $sessionQuery = "INSERT INTO visitor_sessions (session_id, created_date, last_active_date, action_points, end_date, fk_visitor_id) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sessionQuery);
        // Bind parameters
        $stmt->bind_param("sssisi", $visitor_session_id, $currentTimestamp, $currentTimestamp, $action_points, $endTime, $visitor_id);
        // Execute query
        $stmt->execute();
        // Close statement
        $stmt->close();
    }
    private function updateSession($visitor_session_id, $visitor_id)
    {
        $sessionExists = $this->checkSessionExists($visitor_session_id, $visitor_id);
        if ($sessionExists) {
            // Get the current timestamp
            $currentTimestamp = date('Y-m-d H:i:s');
            // Calculate end time as start time + 1 day
            $endTime = date('Y-m-d H:i:s', strtotime($currentTimestamp . ' + 1 day'));
            // Update last_active_time and action_points in visitor_sessions table
            $updateQuery = "UPDATE visitor_sessions SET last_active_date = ?, action_points = action_points + 1, end_date = ? WHERE session_id = ? AND fk_visitor_id = ?";
            $stmt = $this->conn->prepare($updateQuery);
            $stmt->bind_param("sssi", $currentTimestamp, $endTime, $visitor_session_id, $visitor_id);
            $stmt->execute();
            $stmt->close();
        } else {
            $this->insertNewSession($visitor_session_id, $visitor_id);
        }
    }
    function checkSessionExists($visitor_session_id, $visitor_id)
    {
        $query = "SELECT COUNT(*) as count FROM visitor_sessions WHERE session_id = ? AND fk_visitor_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $visitor_session_id, $visitor_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        // Return true if session exists, false otherwise
        return $row['count'] > 0;
    }

    public function saveVisitorData($profile_id, $page_tag, $activity_tag, $action_tag)
    {
        $ip = $_SERVER['REMOTE_ADDR'];
        $visitor_id = $this->checkAndGetVisitorId($profile_id, $ip);
        $visitor_session_id = null;
        // Check if the visitor has a session cookie
        if (!isset($_COOKIE['sis_track_id'])) {
            // If no session cookie exists, generate a new session ID
            $visitor_session_id = 'sis_' . substr(md5(uniqid()), 0, 26); // Generating unique ID of length 30 prefixed with 'sis_'
            // Set the session ID as a cookie with an expiration time (e.g., 1 day)
            setcookie('sis_track_id', $visitor_session_id, time() + (86400 * 1), "/");
            // Insert new session
            $this->insertNewSession($visitor_session_id, $visitor_id);
        } else {
            // If a session cookie exists, retrieve the session ID
            $visitor_session_id = $_COOKIE['sis_track_id'];
            // Set the session ID as a cookie with an expiration time (e.g., 1 day)
            setcookie('sis_track_id', $visitor_session_id, time() + (86400 * 1), "/");
            // Update session time and action count
            $this->updateSession($visitor_session_id, $visitor_id);
        }

        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $result = $this->parseUserAgent($userAgent);
        // Insert data into actions table
        $actionQuery = "INSERT INTO visitor_actions (browser_name, browser_version, operating_system, device_type, device_details, rendering_engine, mobile_specific_info, page_tag, activity_tag, action_tag, fk_session_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($actionQuery);
        $stmt->bind_param(
            "ssssssissss",
            $result['browser_name'],
            $result['browser_version'],
            $result['operating_system'],
            $result['device_type'],
            $result['device_details'],
            $result['rendering_engine'],
            $result['mobile_specific_info'],
            $page_tag,
            $activity_tag,
            $action_tag,
            $visitor_session_id
        );
        if ($stmt->execute()) {
            $stmt->close();
            // Insertion successful
            return true;
        } else {
            $stmt->close();
            // Insertion failed
            return false;
        }
        return true;
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
        // Fetch visitor count
        $query = "SELECT count(*) as count FROM visitors
                  WHERE fk_profile_id = '$profile_id'";
        $result = $this->conn->query($query);
        $row = $result->fetch_assoc();
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
