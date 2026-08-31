<?php
// PRODUCTION database credentials.
//
// This file is the release copy: build.bat overlays it onto
// release_<stamp>/backend/config/configDatabase.php, so the local development
// credentials in version_1.09/backend/config/ are never shipped.
//
// Every value can still be overridden by an environment variable on the host.

define('DB_HOST', getenv('DB_HOST') ?: 'sql112.infinityfree.com');
define('DB_USERNAME', getenv('DB_USERNAME') ?: 'if0_34434817');
define('DB_PASSWORD', getenv('DB_PASSWORD') ?: 'sBvRopmB4I0QGkB');
define('DB_DATABASE', getenv('DB_DATABASE') ?: 'if0_34434817_portfolio');
