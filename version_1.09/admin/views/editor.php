<?php
/**
 * Included by index.php, which supplies every variable below.
 *
 * @var array        $schema   Section and field definitions from lib/schema.php
 * @var array|null   $profile  The `profile` object being edited
 * @var ProfileStore $store    Backing file, used here for its timestamp
 * @var string       $csrf     CSRF token for the save form
 * @var string       $fatal    Non-empty when profile.json could not be opened
 * @var array        $errors   Validation problems from the last save attempt
 * @var array|null   $flash    One-shot message carried over a redirect
 */
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Content — <?= e($profile['info']['full_name'] ?? 'Profile') ?></title>
  <link rel="icon" href="./assets/favicon.svg" />
  <link rel="stylesheet" href="assets/admin.css" />
</head>

<body>

<?php if ($fatal !== ''): ?>
  <main class="fatal">
    <h1>Cannot open profile.json</h1>
    <p><?= e($fatal) ?></p>
    <p class="muted">Expected at <code><?= e(realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'profile.json') ?></code></p>
    <a class="ghost" href="?logout=1">Sign out</a>
  </main>
<?php else: ?>

  <form method="post" id="editor">
    <input type="hidden" name="action" value="save" />
    <input type="hidden" name="csrf" value="<?= e($csrf) ?>" />

    <header class="topbar">
      <div class="brand">
        <img src="./assets/favicon.svg" alt="" />
        <div>
          <strong>Content Panel</strong>
          <span class="muted">data/profile.json<?php
            $modified = $store->lastModified();
            echo $modified ? ' · updated ' . e(date('d M Y, H:i', $modified)) : '';
          ?></span>
        </div>
      </div>
      <div class="topbar-actions">
        <span id="dirty-flag" class="pill hidden">Unsaved changes</span>
        <a class="ghost" href="../data/profile.json" target="_blank" rel="noreferrer">View JSON</a>
        <a class="ghost" href="../" target="_blank" rel="noreferrer">View site</a>
        <a class="ghost" href="?logout=1">Sign out</a>
        <button type="submit" class="primary">Save changes</button>
      </div>
    </header>

    <?php if ($flash && ($flash['type'] ?? '') === 'success'): ?>
      <div class="banner success"><?= e($flash['message']) ?></div>
      <?php foreach (($flash['warnings'] ?? array()) as $warning): ?>
        <div class="banner warn"><?= e($warning) ?></div>
      <?php endforeach; ?>
    <?php endif; ?>

    <?php if (!empty($errors)): ?>
      <div class="banner error">
        <strong>Nothing was saved — <?= count($errors) ?> problem(s) to fix:</strong>
        <ul><?php foreach ($errors as $error): ?><li><?= e($error) ?></li><?php endforeach; ?></ul>
      </div>
    <?php endif; ?>

    <div class="layout">
      <nav class="tabs" id="tabs">
        <?php foreach ($schema as $sectionName => $section): ?>
          <button type="button" class="tab" data-target="<?= e($sectionName) ?>">
            <?= e($section['label']) ?>
            <?php if ($section['kind'] === 'list'): ?>
              <span class="count" data-count-for="<?= e($sectionName) ?>"><?= count($profile[$sectionName]) ?></span>
            <?php endif; ?>
          </button>
        <?php endforeach; ?>
      </nav>

      <div class="panels">
        <?php foreach ($schema as $sectionName => $section): ?>
          <section class="panel" id="panel-<?= e($sectionName) ?>" data-section="<?= e($sectionName) ?>">
            <div class="panel-head">
              <div>
                <h2><?= e($section['label']) ?></h2>
                <?php if (!empty($section['help'])): ?>
                  <p class="help"><?= e($section['help']) ?></p>
                <?php endif; ?>
              </div>
              <?php if ($section['kind'] === 'list'): ?>
                <div class="panel-tools">
                  <input type="search" class="search" placeholder="Filter&hellip;" data-search-for="<?= e($sectionName) ?>" />
                  <button type="button" class="ghost expand-all">Expand all</button>
                  <button type="button" class="primary add-item" data-section="<?= e($sectionName) ?>">
                    + Add <?= e($section['singular']) ?>
                  </button>
                </div>
              <?php endif; ?>
            </div>

            <?php if ($section['kind'] === 'object'): ?>
              <div class="card">
                <div class="grid">
                  <?php foreach ($section['fields'] as $field): ?>
                    <?php admin_render_field($field, $profile['info'][$field['name']] ?? '', 'info'); ?>
                  <?php endforeach; ?>
                </div>
              </div>
            <?php else: ?>
              <div class="items" data-list="<?= e($sectionName) ?>">
                <?php foreach ($profile[$sectionName] as $index => $item): ?>
                  <?php admin_render_item($section, $sectionName, $item, $index); ?>
                <?php endforeach; ?>
              </div>
              <p class="empty <?= count($profile[$sectionName]) ? 'hidden' : '' ?>" data-empty-for="<?= e($sectionName) ?>">
                Nothing here yet. Use <em>Add <?= e($section['singular']) ?></em> above.
              </p>
            <?php endif; ?>
          </section>
        <?php endforeach; ?>
      </div>
    </div>
  </form>

  <?php // Blank rows cloned by the Add buttons. __INDEX__ / __MINDEX__ are replaced in JS. ?>
  <?php foreach ($schema as $sectionName => $section): ?>
    <?php if ($section['kind'] !== 'list') continue; ?>
    <template id="tpl-<?= e($sectionName) ?>">
      <?php admin_render_item($section, $sectionName, array(), '__INDEX__', true); ?>
    </template>
    <?php if (!empty($section['children'])): ?>
      <?php foreach ($section['children'] as $childName => $childSection): ?>
        <template id="tpl-<?= e($sectionName) ?>-<?= e($childName) ?>">
          <?php admin_render_child($childSection, $sectionName . '[__PINDEX__][' . $childName . ']', array(), '__MINDEX__', true); ?>
        </template>
      <?php endforeach; ?>
    <?php endif; ?>
  <?php endforeach; ?>

  <script src="assets/admin.js"></script>
<?php endif; ?>

</body>

</html>
