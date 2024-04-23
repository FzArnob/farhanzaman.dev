<?php
$user_agent = $_SERVER['HTTP_USER_AGENT'];

function get_browser_name($user_agent) {
    if (strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR/')) return 'Opera';
    elseif (strpos($user_agent, 'Edge')) return 'Edge';
    elseif (strpos($user_agent, 'Chrome')) return 'Chrome';
    elseif (strpos($user_agent, 'Safari')) return 'Safari';
    elseif (strpos($user_agent, 'Firefox')) return 'Firefox';
    elseif (strpos($user_agent, 'MSIE') || strpos($user_agent, 'Trident/7')) return 'Internet Explorer';
    return 'Unknown';
}

function get_operating_system($user_agent) {
    if (strpos($user_agent, 'Windows')) return 'Windows';
    elseif (strpos($user_agent, 'iPhone')) return 'iPhone/iOs';
    elseif (strpos($user_agent, 'iPad')) return 'iPad/iOs';
    elseif (strpos($user_agent, 'Android')) return 'Android';
    elseif (strpos($user_agent, 'Ubuntu')) return 'Ubuntu';
    elseif (strpos($user_agent, 'Linux')) return 'Linux';
    elseif (strpos($user_agent, 'Mac')) return 'Mac';
    return 'Unknown';
}

function get_browser_version($user_agent, $browser_name) {
    $known = array('Version', $browser_name, 'other');
    $pattern = '#(?<browser>' . join('|', $known) . ')[/ ]+(?<version>[0-9.|a-zA-Z.]*)#';
    if (!preg_match_all($pattern, $user_agent, $matches)) return 'Unknown';
    $i = count($matches['browser'])-1;
    return $matches['version'][$i];
}

function is_mobile($user_agent) {
    return preg_match('/Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/', $user_agent);
}

$browser_name = get_browser_name($user_agent);
$browser_version = get_browser_version($user_agent, $browser_name);
$operating_system = get_operating_system($user_agent);
$is_mobile = is_mobile($user_agent);

echo "Browser Name: $browser_name</br>";
echo "Browser Version: $browser_version</br>";
echo "Operating System: $operating_system</br>";
echo "Is Mobile: ", $is_mobile ? 'true' : 'false';
?>
