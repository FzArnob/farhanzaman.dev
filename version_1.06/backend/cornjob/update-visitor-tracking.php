<?php
// Include necessary files
require_once '../config/configDatabase.php';

// Database connection
$conn = new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Select IP addresses from visitors table
$sql = "SELECT visitor_id, visitor_ip FROM visitors WHERE is_tracked = 0";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Loop through each row
    while ($row = $result->fetch_assoc()) {
        $ip = $row["visitor_ip"];
        $visitor_id = $row["visitor_id"];

        // Construct API URL with the IP address
        $api_url = "https://api.geoapify.com/v1/ipinfo?ip=$ip&apiKey=b8568cb9afc64fad861a69edbddb2658";

        // Make GET request to API
        $response = file_get_contents($api_url);

        // Parse JSON response
        $data = json_decode($response, true);
        if ($response !== false && isset($data["country"])) {
            // Extract required information
            $continent = $data["continent"]["name"] ?? null;
            $country_iso_code = $data["country"]["iso_code"] ?? null;
            $country_phone_code = $data["country"]["phone_code"] ?? null;
            $country_name = $data["country"]["name"] ?? null;
            $country_currency = $data["country"]["currency"] ?? null;
            $location_latitude = $data["location"]["latitude"] ?? null;
            $location_longitude = $data["location"]["longitude"] ?? null;
            $subdivisions_name = $data["subdivisions"][0]["names"]["en"] ?? null; // Assuming only one subdivision
            $state_name = $data["state"]["name"] ?? null;
            $city_name = $data["city"]["names"]["en"] ?? null;

            // Update visitors table with retrieved information
            $update_sql = "UPDATE visitors SET 
                        is_tracked = 1,
                        continent = '$continent',
                        country_iso_code = '$country_iso_code',
                        country_phone_code = '$country_phone_code',
                        country_name = '$country_name',
                        country_currency = '$country_currency',
                        location_latitude = '$location_latitude',
                        location_longitude = '$location_longitude',
                        subdivisions_name = '$subdivisions_name',
                        state_name = '$state_name',
                        city_name = '$city_name'
                       WHERE visitor_id = $visitor_id";

            if ($conn->query($update_sql) === TRUE) {
                echo "Record updated successfully for visitor ID: $visitor_id<br>";
            } else {
                echo "Error updating record: " . $conn->error;
            }
        }
        sleep(1);
    }
} else {
    echo "No records found to update in visitors table";
}

// Close connection
$conn->close();
