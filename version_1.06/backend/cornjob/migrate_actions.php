<?php
// Include necessary files
require_once '../config/configDatabase.php';

// Database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);



function createSession($conn, $visitor_id, $created_date)
{
    $visitor_session_id = 'sis_' . substr(md5(uniqid()), 0, 26);
    $currentTimestamp = date('Y-m-d H:i:s', strtotime($created_date));
    $endTime = date('Y-m-d H:i:s', strtotime($currentTimestamp . ' + 1 day'));
    $action_points = 1;

    // Insert new session into visitor_sessions table
    $sessionQuery = "INSERT INTO visitor_sessions (session_id, created_date, last_active_date, action_points, end_date, fk_visitor_id) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sessionQuery);
    // Bind parameters
    $stmt->bind_param("sssiis", $visitor_session_id, $currentTimestamp, $currentTimestamp, $action_points, $endTime, $visitor_id);
    // Execute query
    $stmt->execute();
    // Close statement
    $stmt->close();
    return $visitor_session_id;
}


// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Select IP addresses from visitors table
$sql = "SELECT visitor_id, visitor_ip FROM visitors";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Loop through each row
    while ($row = $result->fetch_assoc()) {
        $ip = $row["visitor_ip"];
        $visitor_id = $row["visitor_id"];
        // Fetch data from visitors_old table for the current IP address
        $old_data_sql = "SELECT * FROM visitors_old WHERE visitor_ip = '$ip' ORDER BY created_date DESC";
        $old_data_result = $conn->query($old_data_sql);

        $previous_created_date = null;
        $previous_visitor_session_id = null;
        if ($old_data_result->num_rows > 0) {
            $page_tag = "Home";
            $activity_tag = "Visit";
            $action_tag = "View";
            // Loop through each row of old data
            while ($old_row = $old_data_result->fetch_assoc()) {
                $created_date = $old_row["created_date"];
                if ($previous_created_date === null) $visitor_session_id = createSession($conn, $visitor_id, $created_date);
                // Check if there's a gap of 1 day between consecutive records
                if ($previous_created_date !== null && strtotime($previous_created_date) - strtotime($created_date) >= 86400) {
                    // Create a new session
                    $visitor_session_id = createSession($conn, $visitor_id, $created_date);
                }

                if ($previous_visitor_session_id === $visitor_session_id) {

                    $currentTimestamp = date('Y-m-d H:i:s', strtotime($created_date));
                    $endTime = date('Y-m-d H:i:s', strtotime($currentTimestamp . ' + 1 day'));
                    // update session
                    $updateSessionQuery = "UPDATE visitor_sessions SET last_active_date = ?, end_date = ?, action_points = action_points + 1 WHERE session_id = ?";
                    $stmt = $conn->prepare($updateSessionQuery);
                    $stmt->bind_param("sss", $currentTimestamp, $endTime, $visitor_session_id);
                    $stmt->execute();
                    $stmt->close();
                }
                $browserNamesMap = array(
                    'Chrome' => 'Google Chrome',
                    'Firefox' => 'Mozilla Firefox',
                    'Safari' => 'Safari'
                );
                $operatingSystemsMap = array(
                    'Windows' => 'Microsoft Windows',
                    'Macintosh' => 'Mac OS',
                    'Android' => 'Android',
                    'iOS' => 'iOS',
                    'Linux' => 'Linux'
                );

                $browser_name = isset($browserNamesMap[$old_row['browser_name']]) ? $browserNamesMap[$old_row['browser_name']] : 'Other';
                $browser_version = !isset($old_row['browser_version']) || $old_row['browser_version'] === '' ? 'N/A' : $old_row['browser_version'];
                $operating_system = isset($operatingSystemsMap[$old_row['operating_system']]) ? $operatingSystemsMap[$old_row['operating_system']] : 'Other';
                $device_type = !isset($old_row['device_type']) || $old_row['device_type'] === '' ? 'Other' : $old_row['device_type'];
                $device_details = !isset($old_row['device_details']) || $old_row['device_details'] === '' ? 'N/A' : $old_row['device_details'];
                $rendering_engine = !isset($old_row['rendering_engine']) || $old_row['rendering_engine'] === '' ? 'N/A' : $old_row['rendering_engine'];
                $mobile_specific_info = $old_row['device_type'] === 'Mobile' ? 1 : 0;
                // Check if rendering engine contains only integers and periods
                if (!preg_match('/^[0-9.]+$/', $rendering_engine)) {
                    $rendering_engine = 'N/A';
                }
                $actionQuery = "INSERT INTO visitor_actions (browser_name, browser_version, operating_system, device_type, device_details, rendering_engine, mobile_specific_info, page_tag, activity_tag, action_tag, fk_session_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $conn->prepare($actionQuery);
                $stmt->bind_param(
                    "ssssssissss",
                    $browser_name,
                    $browser_version,
                    $operating_system,
                    $device_type,
                    $device_details,
                    $rendering_engine,
                    $mobile_specific_info,
                    $page_tag,
                    $activity_tag,
                    $action_tag,
                    $visitor_session_id
                );
                if ($stmt->execute()) {
                    $stmt->close();
                    // Insertion successful
                    echo "Success for old id: " . $old_row['visitor_id']."<br/>";
                } else {
                    $stmt->close();
                    // Insertion failed
                    echo "Failed for old id: " . $old_row['visitor_id']."<br/>";
                }
                $previous_created_date = $created_date;
                $previous_visitor_session_id = $visitor_session_id;
            }
        }
    }
} else {
    echo "No records found to update.";
}

// Close connection
$conn->close();
