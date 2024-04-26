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
    public function saveVisitorData($profile_id)
    {
        $userAgent = $_SERVER['HTTP_USER_AGENT'];
        $result = $this->parseUserAgent($userAgent);

        $query = "INSERT INTO visitors (visitor_ip, fk_profile_id, browser_name, browser_version, operating_system, device_type, device_details, rendering_engine, mobile_specific_info) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param(
            "sssssssss",
            $_SERVER['REMOTE_ADDR'],
            $profile_id,
            $result['browser_name'],
            $result['browser_version'],
            $result['operating_system'],
            $result['device_type'],
            $result['device_details'],
            $result['rendering_engine'],
            $result['mobile_specific_info']
        );
        if ($_SERVER['REMOTE_ADDR'] == "::1") return false;
        if ($stmt->execute()) {
            // Insertion successful
            return true;
        } else {
            // Insertion failed
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
