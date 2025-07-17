<?php
// Get the requested URL path
$requestUri = $_SERVER['REQUEST_URI'];
// Remove leading and trailing slashes and any potential query strings
$path = trim(parse_url($requestUri, PHP_URL_PATH), '/');

// Split the path into parts
$parts = explode("/", $path);

// Get the route from the first part
$route = isset($parts[0]) ? $parts[0] : 'none';

// If there are query parameters, remove them from the route
if (strpos($route, '?') !== false) {
    list($route, $queryString) = explode('?', $route, 2);
}

// Define the valid routes and their corresponding HTML files
$routes = array(
    ''         => 'home.html',    // Home page
    'about'    => 'about.html',
    'works'    => 'works.html',
    'work'     => 'work.html',
    'gaming'   => 'gaming.html',
    'hobbies'  => 'hobbies.html',
    'expertise' => 'expertise.html',
    '403'      => '403.html',
    '404'      => '404.html',
    '500'      => '500.html'
);

// Check if the requested route exists in the defined routes
if (isset($routes[$route])) {
    // If the route exists, serve the corresponding HTML file
    $file = $routes[$route];
    if (file_exists($file)) {
        // Set the appropriate content type
        header('Content-Type: text/html');
        // Read and output the HTML file
        readfile($file);
        exit;
    }
} else {
    header('Location: /404');
    exit;
}
?>
