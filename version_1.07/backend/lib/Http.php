<?php
// Small helpers shared by every endpoint.

class Http
{
    public static function cors($methods = 'POST, OPTIONS')
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: ' . $methods);
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
        header('Content-Type: application/json');
    }

    /** Answers CORS preflight requests and stops. */
    public static function handlePreflight()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public static function json($payload, $statusCode = 200)
    {
        http_response_code($statusCode);
        echo json_encode($payload);
        exit;
    }

    public static function error($message, $statusCode = 400)
    {
        self::json(array('success' => false, 'message' => $message), $statusCode);
    }

    /** Reads a JSON request body, falling back to form encoded input. */
    public static function input()
    {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        if (is_array($decoded)) {
            return $decoded;
        }
        return $_POST;
    }
}
