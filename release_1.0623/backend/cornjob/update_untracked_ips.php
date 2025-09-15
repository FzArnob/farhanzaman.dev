<?php
// cornjob/update_untracked_ips.php
// This script finds all untracked IPs, calls Geoapify API, and updates the visitor_locations table.

require_once __DIR__ . '/../config/configDatabase.php';

// Create DB connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);
if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}

// Get all untracked IPs (is_tracked = 0 or NULL)
$sql = "SELECT visitor_ip FROM visitor_locations WHERE is_tracked = 0 OR is_tracked IS NULL";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $ip = $row['visitor_ip'];
        $api_url = "https://api.geoapify.com/v1/ipinfo?ip=$ip&apiKey=b8568cb9afc64fad861a69edbddb2658";
        $response = @file_get_contents($api_url);
        $data = $response !== false ? json_decode($response, true) : null;

        $is_tracked = 0;
        $continent = null;
        $country_name = null;
        $location_latitude = null;
        $location_longitude = null;
        $state_name = null;
        $city_name = null;
        $tracked_date = null;

        if ($data && isset($data["country"])) {
            $is_tracked = 1;
            $tracked_date = date('Y-m-d H:i:s');
            $continent = isset($data["continent"]["name"]) ? $data["continent"]["name"] : null;
            $country_name = isset($data["country"]["name"]) ? $data["country"]["name"] : null;
            $location_latitude = isset($data["location"]["latitude"]) ? $data["location"]["latitude"] : null;
            $location_longitude = isset($data["location"]["longitude"]) ? $data["location"]["longitude"] : null;
            $state_name = isset($data["state"]["name"]) ? $data["state"]["name"] : null;
            $city_name = isset($data["city"]["name"]) ? $data["city"]["name"] : null;
        }

        // Update the record
        $updateQuery = "UPDATE visitor_locations SET is_tracked=?, continent=?, country_name=?, location_latitude=?, location_longitude=?, state_name=?, city_name=?, tracked_date=? WHERE visitor_ip=?";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bind_param("issddssss", $is_tracked, $continent, $country_name, $location_latitude, $location_longitude, $state_name, $city_name, $tracked_date, $ip);
        $stmt->execute();
        $stmt->close();
    }
    echo "Untracked IPs updated.";
} else {
    echo "No untracked IPs found.";
}

$conn->close();
