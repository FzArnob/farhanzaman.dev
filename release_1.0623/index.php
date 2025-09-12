<?php
// Get the requested URL path
$requestUri = $_SERVER['REQUEST_URI'];
// Remove leading and trailing slashes and any potential query strings
$path = trim(parse_url($requestUri, PHP_URL_PATH), '/');

$basePath = 'farhanzaman.dev/version_1.06';
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
    $path = ltrim($path, '/');
}

// Split the path into parts
$parts = explode("/", $path);

// Get the route from the first part
$route = isset($parts[0]) ? $parts[0] : 'none';

// If there are query parameters, remove them from the route
if (strpos($route, '?') !== false) {
    list($route, $queryString) = explode('?', $route, 2);
}

// Define the valid routes and their corresponding HTML files from GitHub
$routes = array(
    ''         => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/home.html',    // Home page
    'about'    => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/about.html',
    'works'    => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/works.html',
    'work'     => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/work.html',
    'gaming'   => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/gaming.html',
    'hobbies'  => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/hobbies.html',
    'expertise' => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/expertise.html',
    '403'      => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/403.html',
    '404'      => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/404.html',
    '500'      => 'https://raw.githubusercontent.com/FzArnob/farhanzaman.dev/refs/heads/main/release_1.0623/500.html'
);

// Check if the requested route exists in the defined routes
if (isset($routes[$route])) {
    // If the route exists, fetch and serve the corresponding HTML file from GitHub
    $fileUrl = $routes[$route];
    
    // Fetch the content from GitHub
    $content = file_get_contents($fileUrl);
    
    if ($content !== false) {
        // Set the appropriate content type
        header('Content-Type: text/html');
        // Output the HTML content
        echo $content;
        exit;
    } else {
        // If file couldn't be fetched from GitHub, redirect to 404
        header('Location: /404');
        exit;
    }
} else {
    // If route doesn't exist, redirect to 404
    header('Location: /404');
    exit;
}
?>
