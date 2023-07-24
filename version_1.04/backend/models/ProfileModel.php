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
                $info['browser_version'] = $this->getBrowserVersion($userAgent, $browser);
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
        $info['device_details'] = $this->getDeviceManufacturer($userAgent);

        // Extract rendering engine (if available)
        $info['rendering_engine'] = $this->getRenderingEngine($userAgent);

        // Extract mobile-specific information (if available)
        if ($info['device_type'] === 'Mobile') {
            $info['mobile_specific_info'] = $this->getMobileSpecificInfo($userAgent);
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
            $result['profile']['info'] = $profile_info;
        } else {
            $result['profile']['info'] = array();
        }
        // Fetch education items
        $query = "SELECT education_items.* FROM education_items
              INNER JOIN profile_education ON education_items.education_id = profile_education.fk_education_id
              WHERE profile_education.fk_profile_id = '$profile_id'";
        $education_items_result = $this->conn->query($query);
        if ($education_items_result) {
            $education_items = $education_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['educations'] = $education_items;
        } else {
            $result['profile']['educations'] = array();
        }
        // Fetch experience items
        $query = "SELECT experience_items.* FROM experience_items
              INNER JOIN profile_experience ON experience_items.experience_id = profile_experience.fk_experience_id
              WHERE profile_experience.fk_profile_id = '$profile_id'";
        $experience_items_result = $this->conn->query($query);
        if ($experience_items_result) {
            $experience_items = $experience_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['experiences'] = $experience_items;
        } else {
            $result['profile']['experiences'] = array();
        }
        // Fetch expertise items
        $query = "SELECT expertise_items.* FROM expertise_items
              INNER JOIN profile_expertise ON expertise_items.expertise_id = profile_expertise.fk_expertise_id
              WHERE profile_expertise.fk_profile_id = '$profile_id'";
        $expertise_items_result = $this->conn->query($query);
        if ($expertise_items_result) {
            $expertise_items = $expertise_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['expertises'] = $expertise_items;
        } else {
            $result['profile']['expertises'] = array();
        }
        // Fetch skill items
        $query = "SELECT skill_items.* FROM skill_items
              INNER JOIN profile_skill ON skill_items.skill_id = profile_skill.fk_skill_id
              WHERE profile_skill.fk_profile_id = '$profile_id'";
        $skill_items_result = $this->conn->query($query);
        if ($skill_items_result) {
            $skill_items = $skill_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['skills'] = $skill_items;
        } else {
            $result['profile']['skills'] = array();
        }
        // Fetch achievement items
        $query = "SELECT achievement_items.* FROM achievement_items
              INNER JOIN profile_achievement ON achievement_items.achievement_id = profile_achievement.fk_achievement_id
              WHERE profile_achievement.fk_profile_id = '$profile_id'";
        $achievement_items_result = $this->conn->query($query);
        if ($achievement_items_result) {
            $achievement_items = $achievement_items_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['achievements'] = $achievement_items;
        } else {
            $result['profile']['achievements'] = array();
        }
        // Fetch projects
        $query = "SELECT projects.* FROM projects
              INNER JOIN profile_projects ON projects.project_id = profile_projects.fk_project_id
              WHERE profile_projects.fk_profile_id = '$profile_id'";
        $projects_result = $this->conn->query($query);
        if ($projects_result) {
            $projects = $projects_result->fetch_all(MYSQLI_ASSOC);
            $result['profile']['projects'] = $projects;
        } else {
            $result['profile']['projects'] = array();
        }
        // Fetch gallery items
        $query = "SELECT gallery_items.* FROM gallery_items
              INNER JOIN profile_gallery_items ON gallery_items.gallery_item_id = profile_gallery_items.fk_item_id
              WHERE profile_gallery_items.fk_profile_id = '$profile_id'";
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
        $stmt = $this->conn->prepare("INSERT INTO direct_messages (name, email, subject, message) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $email, $subject, $message);
        if ($stmt->execute()) {
            // Data inserted successfully
            $data = array();
            $data["id"] = $stmt->insert_id;
            $data["name"] = $name;
            $data["email"] = $email;
            $data["subject"] = $subject;
            $sql = "INSERT INTO profile_direct_messages (fk_profile_id, fk_message_id) VALUES (?, ?)";
            // Prepare and bind the parameters
            $stmt1 = $this->conn->prepare($sql);
            $fk_profile_id = $profileId;
            $fk_message_id = $stmt->insert_id;
            $stmt1->bind_param("ss", $fk_profile_id, $fk_message_id);
            // Execute the prepared statement
            if ($stmt1->execute()) {
                http_response_code(200);
                $result["message"] = "Success: add";
                $result["data"] = $data;
            } else {
                // Failed to insert data
                http_response_code(500);
                $this->conn->rollback();
                $result["message"] = "Error: " . $stmt1->error;
            }
            $stmt1->close();
        } else {
            // Failed to insert data
            http_response_code(500);
            $this->conn->rollback();
            $result["message"] = "Error: " . $stmt->error;
        }
        $stmt->close();
        return $result;
    }
}
