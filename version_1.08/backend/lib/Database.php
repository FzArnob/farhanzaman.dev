<?php
require_once __DIR__ . '/../config/configDatabase.php';

class Database
{
    /** Opens the single mysqli connection used by an endpoint. */
    public static function connect()
    {
        // Handle connection failures here rather than letting mysqli print a warning
        // or throw — anything echoed before the body would corrupt the JSON response.
        mysqli_report(MYSQLI_REPORT_OFF);
        $conn = @new mysqli(DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE);

        if ($conn->connect_error) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(array(
                'success' => false,
                'message' => 'Database connection failed',
            ));
            exit;
        }

        $conn->set_charset('utf8mb4');
        return $conn;
    }
}
