<?php
/**
 * Included by index.php, which supplies every variable below.
 *
 * @var string $csrf       CSRF token for the login form
 * @var string $loginError Message shown after a failed or locked-out attempt
 */
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Sign in — Content Panel</title>
  <link rel="icon" href="./assets/favicon.svg" />
  <link rel="stylesheet" href="assets/admin.css" />
</head>

<body class="login-page">
  <main class="login-card">
    <img class="login-logo" src="./assets/favicon.svg" alt="" />
    <h1>Content Panel</h1>
    <p class="muted">Edit the profile data behind the site.</p>

    <?php if ($loginError !== ''): ?>
      <div class="banner error"><?= e($loginError) ?></div>
    <?php endif; ?>

    <form method="post" autocomplete="off">
      <input type="hidden" name="action" value="login" />
      <input type="hidden" name="csrf" value="<?= e($csrf) ?>" />
      <label for="password">Password</label>
      <input id="password" type="password" name="password" required autofocus />
      <button type="submit" class="primary">Sign in</button>
    </form>
  </main>
</body>

</html>
