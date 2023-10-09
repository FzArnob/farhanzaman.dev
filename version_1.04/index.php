<?php
// Get the requested URL path
$requestUri = $_SERVER['REQUEST_URI'];
// Remove leading and trailing slashes and any potential query strings
$path = trim(parse_url($requestUri, PHP_URL_PATH), '/');

$parts = explode("/", $path);

$route = isset($parts[0]) ? $parts[0] : 'none';
$param1 = isset($parts[1]) ? $parts[1] : 'none';
echo $route.', '.$param1;

// Define the valid routes and their corresponding HTML files
$routes = array(
    ''         => 'home.html',    // Home page
    'about'    => 'about.html',
    'works'    => 'works.html',
    'hobbies'  => 'hobbies.html',
    'expertise' => 'expertise.html',
    'work' => 'work.html'
);

// echo '<br/>'.$path;

// Check if the requested route exists in the defined routes
if (isset($routes[$route])) {
    // If the route exists, serve the corresponding HTML file
    $file = $routes[$route];
    if (file_exists($file)) {
        // Set the appropriate content type
        header('Content-Type: text/html');
        // // Read and output the HTML file
        // readfile($file);
        $content = file_get_contents($file);

        // Output the modified HTML content
        echo $content;
        exit;
    }
}

// If the requested route is not found, serve a 404 HTML file
http_response_code(404);
include('404.html');
