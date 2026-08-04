<?php

/** Turns a submitted value into the shape profile.json expects. */
function admin_normalize_value(array $field, $raw)
{
    $type = isset($field['type']) ? $field['type'] : 'text';

    if ($type === 'lines') {
        $lines = preg_split('/\r\n|\r|\n/', (string)$raw);
        $out = array();
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line !== '') {
                $out[] = $line;
            }
        }
        return $out;
    }

    $value = is_string($raw) ? trim($raw) : $raw;
    $value = is_scalar($value) ? (string)$value : '';

    // Normalise the newlines inside long text so the JSON stays consistent.
    if ($type === 'textarea' || $type === 'html') {
        $value = str_replace(array("\r\n", "\r"), "\n", $value);
    }

    if ($value === '' && !empty($field['nullable'])) {
        return null;
    }

    return $value;
}

/** Reads a stored value back into something an input can display. */
function admin_display_value(array $field, $value)
{
    if (isset($field['type']) && $field['type'] === 'lines') {
        return is_array($value) ? implode("\n", $value) : (string)$value;
    }
    return $value === null ? '' : (string)$value;
}

/** Blank item shaped like the ones already in the file, so key order stays stable. */
function admin_default_item(array $section, $newId, $profileId, array $existingItems)
{
    $item = array();

    if (!empty($existingItems)) {
        foreach ($existingItems[0] as $key => $value) {
            $item[$key] = is_array($value) ? array() : '';
        }
    }

    foreach ($section['fields'] as $field) {
        if (!array_key_exists($field['name'], $item)) {
            $item[$field['name']] = '';
        }
    }

    $item[$section['key']] = (string)$newId;

    // Child collections (project media) carry no bookkeeping columns.
    if (empty($section['parent_key'])) {
        $now = date('Y-m-d H:i:s');
        $item['created_date'] = $now;
        $item['updated_date'] = $now;
        $item['delete_flag'] = '0';
        $item['fk_profile_id'] = $profileId;
    }

    return $item;
}

function admin_max_id(array $items, $key)
{
    $max = 0;
    foreach ($items as $item) {
        if (isset($item[$key]) && (int)$item[$key] > $max) {
            $max = (int)$item[$key];
        }
    }
    return $max;
}

/**
 * Rebuilds one collection from submitted rows. Rows carrying a known __id keep
 * every column that is not shown in the form (created_date, delete_flag, ...);
 * rows without one become new items with the next free id.
 */
function admin_build_list(array $section, $rows, array $existing, $profileId)
{
    if (!is_array($rows)) {
        return array();
    }

    $key = $section['key'];
    $byId = array();
    foreach ($existing as $item) {
        if (isset($item[$key])) {
            $byId[(string)$item[$key]] = $item;
        }
    }

    $nextId = admin_max_id($existing, $key);
    $out = array();

    foreach ($rows as $row) {
        if (!is_array($row)) {
            continue;
        }

        $id = isset($row['__id']) ? trim((string)$row['__id']) : '';

        if ($id !== '' && isset($byId[$id])) {
            $item = $byId[$id];
        } else {
            $nextId++;
            $item = admin_default_item($section, $nextId, $profileId, $existing);
        }

        foreach ($section['fields'] as $field) {
            $raw = isset($row[$field['name']]) ? $row[$field['name']] : '';
            $item[$field['name']] = admin_normalize_value($field, $raw);
        }

        if (!empty($section['children'])) {
            foreach ($section['children'] as $childName => $childSection) {
                $childSection['key'] = $childSection['key'];
                $childExisting = isset($item[$childName]) && is_array($item[$childName]) ? $item[$childName] : array();
                $childRows = isset($row[$childName]) ? $row[$childName] : array();
                $children = admin_build_list($childSection, $childRows, $childExisting, $profileId);

                // Keep the parent reference in sync, including for brand new rows.
                if (!empty($childSection['parent_key'])) {
                    foreach ($children as $index => $child) {
                        $children[$index][$childSection['parent_key']] = (string)$item[$key];
                    }
                }

                $item[$childName] = $children;
            }
        }

        $out[] = $item;
    }

    return $out;
}

/** Builds the complete profile array from $_POST, falling back to what is on disk. */
function admin_build_profile(array $post, array $current, array $schema)
{
    $profile = $current;

    $infoSection = $schema['info'];
    $infoPost = isset($post['info']) && is_array($post['info']) ? $post['info'] : array();
    foreach ($infoSection['fields'] as $field) {
        if (array_key_exists($field['name'], $infoPost)) {
            $profile['info'][$field['name']] = admin_normalize_value($field, $infoPost[$field['name']]);
        }
    }
    $profileId = isset($profile['info']['profile_id']) ? $profile['info']['profile_id'] : 'profile';

    foreach ($schema as $name => $section) {
        if ($section['kind'] !== 'list') {
            continue;
        }
        $existing = isset($current[$name]) && is_array($current[$name]) ? $current[$name] : array();
        $rows = isset($post[$name]) ? $post[$name] : array();
        $profile[$name] = admin_build_list($section, $rows, $existing, $profileId);
    }

    return $profile;
}

/** @return array of human readable problems; empty means the data is safe to write. */
function admin_validate(array $profile, array $schema)
{
    $errors = array();
    $info = isset($profile['info']) ? $profile['info'] : array();

    if (empty($info['profile_id'])) {
        $errors[] = 'Profile Info: profile ID is required.';
    } elseif (!preg_match('/^[A-Za-z0-9_-]{1,20}$/', $info['profile_id'])) {
        $errors[] = 'Profile Info: profile ID may only contain letters, numbers, hyphen and underscore (max 20).';
    }

    if (empty($info['full_name'])) {
        $errors[] = 'Profile Info: full name is required.';
    }
    if (empty($info['website_base_url']) || !preg_match('#^https?://#', $info['website_base_url'])) {
        $errors[] = 'Profile Info: website base URL must start with http:// or https://';
    }
    if (empty($info['website_domain_name'])) {
        $errors[] = 'Profile Info: website domain is required.';
    }
    if (empty($info['designations'])) {
        $errors[] = 'Profile Info: at least one designation is required.';
    }

    foreach ($schema as $name => $section) {
        if ($section['kind'] !== 'list') {
            continue;
        }
        $titleField = $section['title'];
        foreach ($profile[$name] as $index => $item) {
            $position = $index + 1;
            if (!isset($item[$titleField]) || trim((string)$item[$titleField]) === '') {
                $errors[] = $section['label'] . ' #' . $position . ': ' . $titleField . ' is required.';
            }
            if ($name === 'skills') {
                $percentage = (string)$item['percentage'];
                if ($percentage === '' || !is_numeric($percentage) || (float)$percentage < 0 || (float)$percentage > 100) {
                    $errors[] = $section['label'] . ' #' . $position . ': percentage must be a number between 0 and 100.';
                }
            }
            if (!empty($section['children'])) {
                foreach ($section['children'] as $childName => $childSection) {
                    foreach ($item[$childName] as $childIndex => $child) {
                        if (trim((string)$child['media_link']) === '') {
                            $errors[] = $section['label'] . ' #' . $position . ', ' . $childSection['label'] . ' #' . ($childIndex + 1) . ': link is required.';
                        }
                    }
                }
            }
        }
    }

    return $errors;
}

/** Non-blocking notes shown after a successful save. */
function admin_warnings(array $profile)
{
    $warnings = array();
    $projectCount = count($profile['projects']);
    if ($projectCount < 8) {
        $warnings[] = 'The home page marquee reads 8 projects on wide screens; there are only ' . $projectCount . '. Add more or the marquee will break.';
    }
    if (count($profile['gallery']) < 10) {
        $warnings[] = 'The home page gallery shows up to 10 items on wide screens; there are only ' . count($profile['gallery']) . '.';
    }
    return $warnings;
}
