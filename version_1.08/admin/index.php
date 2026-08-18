<?php
/**
 * Profile content editor for data/profile.json.
 *
 * Single hard coded account: the password below is stored as a bcrypt hash and
 * checked with password_verify. Everything the site renders comes from that one
 * JSON file, so this is the only place content needs to be edited.
 */

declare(strict_types=1);

// bcrypt hash of the admin password.
const ADMIN_PASSWORD_HASH = '$2y$10$zZ3SyezNPYtP.B1ILirEcOphbVXUi5rpq/ZfP1vGPOcSKILH6h1u2';

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCKOUT_SECONDS = 300;
const SESSION_IDLE_SECONDS = 3600;

require_once __DIR__ . '/lib/ProfileStore.php';
require_once __DIR__ . '/lib/schema.php';
require_once __DIR__ . '/lib/builder.php';
require_once __DIR__ . '/lib/render.php';

$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

session_name('portfolio_admin');
session_set_cookie_params(array(
    'lifetime' => 0,
    'path' => dirname($_SERVER['SCRIPT_NAME']),
    'secure' => $isHttps,
    'httponly' => true,
    'samesite' => 'Strict',
));
session_start();

header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store');

// ---------------------------------------------------------------- session ---

function admin_is_authenticated(): bool
{
    if (empty($_SESSION['admin_authenticated'])) {
        return false;
    }
    if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > SESSION_IDLE_SECONDS) {
        admin_logout();
        return false;
    }
    $_SESSION['last_seen'] = time();
    return true;
}

function admin_logout(): void
{
    $_SESSION = array();
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}

function admin_csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function admin_check_csrf(): bool
{
    return !empty($_SESSION['csrf'])
        && isset($_POST['csrf'])
        && hash_equals($_SESSION['csrf'], (string)$_POST['csrf']);
}

function admin_lockout_remaining(): int
{
    if (empty($_SESSION['login_locked_until'])) {
        return 0;
    }
    return max(0, $_SESSION['login_locked_until'] - time());
}

// ---------------------------------------------------------------- actions ---

$loginError = '';
$flash = isset($_SESSION['flash']) ? $_SESSION['flash'] : null;
unset($_SESSION['flash']);

if (isset($_GET['logout'])) {
    admin_logout();
    header('Location: ' . $_SERVER['SCRIPT_NAME']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $remaining = admin_lockout_remaining();
    if ($remaining > 0) {
        $loginError = 'Too many attempts. Try again in ' . ceil($remaining / 60) . ' minute(s).';
    } elseif (!admin_check_csrf()) {
        $loginError = 'Your session expired. Please try again.';
    } elseif (password_verify((string)($_POST['password'] ?? ''), ADMIN_PASSWORD_HASH)) {
        session_regenerate_id(true);
        $_SESSION['admin_authenticated'] = true;
        $_SESSION['last_seen'] = time();
        unset($_SESSION['login_attempts'], $_SESSION['login_locked_until'], $_SESSION['csrf']);
        header('Location: ' . $_SERVER['SCRIPT_NAME']);
        exit;
    } else {
        usleep(400000); // Slow down guessing.
        $_SESSION['login_attempts'] = (int)($_SESSION['login_attempts'] ?? 0) + 1;
        if ($_SESSION['login_attempts'] >= LOGIN_MAX_ATTEMPTS) {
            $_SESSION['login_locked_until'] = time() + LOGIN_LOCKOUT_SECONDS;
            $_SESSION['login_attempts'] = 0;
            $loginError = 'Too many attempts. Locked for ' . (LOGIN_LOCKOUT_SECONDS / 60) . ' minutes.';
        } else {
            $left = LOGIN_MAX_ATTEMPTS - $_SESSION['login_attempts'];
            $loginError = 'Incorrect password. ' . $left . ' attempt(s) left.';
        }
    }
}

// ------------------------------------------------------------- login view ---

if (!admin_is_authenticated()) {
    $csrf = admin_csrf_token();
    include __DIR__ . '/views/login.php';
    exit;
}

// ------------------------------------------------------------------- data ---

$schema = admin_schema();
$store = new ProfileStore(__DIR__ . '/../data/profile.json', __DIR__ . '/../data/backups');

$errors = array();
$warnings = array();
$fatal = '';

try {
    $profile = $store->load();
} catch (Throwable $exception) {
    $profile = null;
    $fatal = $exception->getMessage();
}

if ($profile !== null && $_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'save') {
    if (!admin_check_csrf()) {
        $errors[] = 'Your session expired before the save completed. Nothing was written — please submit again.';
    } else {
        $candidate = admin_build_profile($_POST, $profile, $schema);
        $errors = admin_validate($candidate, $schema);

        if (empty($errors)) {
            try {
                $store->save($candidate);
                $_SESSION['flash'] = array(
                    'type' => 'success',
                    'message' => 'Saved to data/profile.json. A backup of the previous version was kept.',
                    'warnings' => admin_warnings($candidate),
                );
                header('Location: ' . $_SERVER['SCRIPT_NAME']);
                exit;
            } catch (Throwable $exception) {
                $errors[] = 'Could not save: ' . $exception->getMessage();
                $profile = $candidate;
            }
        } else {
            // Keep what was typed so nothing is lost.
            $profile = $candidate;
        }
    }
}

$csrf = admin_csrf_token();
include __DIR__ . '/views/editor.php';
