<?php

function e($value)
{
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

/** Renders one input for a field. $namePrefix is e.g. "info" or "educations[0]". */
function admin_render_field(array $field, $value, $namePrefix)
{
    $name = $namePrefix . '[' . $field['name'] . ']';
    $type = isset($field['type']) ? $field['type'] : 'text';
    $width = isset($field['width']) ? $field['width'] : 'full';
    $id = 'f_' . preg_replace('/[^a-z0-9]+/i', '_', $name);
    $display = admin_display_value($field, $value);

    echo '<div class="field field-' . e($width) . '">';
    echo '<label for="' . e($id) . '">' . e($field['label']) . '</label>';

    if ($type === 'textarea' || $type === 'html' || $type === 'lines') {
        $rows = $type === 'lines' ? 4 : ($type === 'html' ? 8 : 4);
        echo '<textarea id="' . e($id) . '" name="' . e($name) . '" rows="' . $rows . '"'
            . ($type === 'html' ? ' spellcheck="false"' : '') . '>' . e($display) . '</textarea>';
    } elseif ($type === 'select') {
        echo '<select id="' . e($id) . '" name="' . e($name) . '">';
        foreach ($field['options'] as $optionValue => $optionLabel) {
            $selected = ((string)$display === (string)$optionValue) ? ' selected' : '';
            echo '<option value="' . e($optionValue) . '"' . $selected . '>' . e($optionLabel) . '</option>';
        }
        echo '</select>';
    } else {
        $inputType = $type === 'number' ? 'number' : 'text';
        echo '<input id="' . e($id) . '" type="' . $inputType . '" name="' . e($name) . '" value="' . e($display) . '"'
            . ($type === 'number' ? ' step="1"' : '') . ' />';
    }

    if (!empty($field['help'])) {
        echo '<p class="help">' . $field['help'] . '</p>';
    }

    echo '</div>';
}

/** One collapsible card for a list item. $index may be the "__INDEX__" placeholder. */
function admin_render_item(array $section, $sectionName, $item, $index, $isTemplate = false)
{
    $key = $section['key'];
    $id = ($isTemplate || !isset($item[$key])) ? '' : (string)$item[$key];
    $prefix = $sectionName . '[' . $index . ']';
    $title = $isTemplate ? 'New ' . $section['singular'] : (string)($item[$section['title']] ?? '');
    $subtitle = $isTemplate ? '' : (string)($item[$section['subtitle']] ?? '');

    echo '<article class="item" data-index="' . e($index) . '" data-search="' . e(strtolower($title . ' ' . $subtitle)) . '">';
    echo '<input type="hidden" name="' . e($prefix) . '[__id]" value="' . e($id) . '" />';

    echo '<header class="item-head">';
    echo '<button type="button" class="collapse" aria-expanded="false"><span class="chev">&#9656;</span></button>';
    echo '<div class="item-title"><strong data-role="title">' . e($title !== '' ? $title : 'Untitled') . '</strong>';
    echo '<span data-role="subtitle">' . e($subtitle) . '</span></div>';
    echo '<span class="badge">' . ($id === '' ? 'new' : '#' . e($id)) . '</span>';
    echo '<button type="button" class="danger remove">Remove</button>';
    echo '</header>';

    echo '<div class="item-body">';
    echo '<div class="grid">';
    foreach ($section['fields'] as $field) {
        $value = $isTemplate ? ($field['type'] === 'lines' ? array() : '') : ($item[$field['name']] ?? '');
        admin_render_field($field, $value, $prefix);
    }
    echo '</div>';

    if (!empty($section['children'])) {
        foreach ($section['children'] as $childName => $childSection) {
            $children = $isTemplate ? array() : (isset($item[$childName]) ? $item[$childName] : array());
            echo '<div class="children" data-child="' . e($childName) . '">';
            echo '<div class="children-head"><h4>' . e($childSection['label'])
                . ' <span class="count">' . count($children) . '</span></h4>';
            echo '<button type="button" class="ghost add-child">+ Add ' . e($childSection['singular']) . '</button></div>';
            echo '<div class="children-list">';
            foreach ($children as $childIndex => $child) {
                admin_render_child($childSection, $prefix . '[' . $childName . ']', $child, $childIndex);
            }
            echo '</div></div>';
        }
    }

    echo '</div></article>';
}

/** A compact row for a nested item (project media). */
function admin_render_child(array $childSection, $namePrefix, $child, $index, $isTemplate = false)
{
    $key = $childSection['key'];
    $id = ($isTemplate || !isset($child[$key])) ? '' : (string)$child[$key];
    $prefix = $namePrefix . '[' . $index . ']';

    echo '<div class="child">';
    echo '<input type="hidden" name="' . e($prefix) . '[__id]" value="' . e($id) . '" />';
    echo '<div class="grid">';
    foreach ($childSection['fields'] as $field) {
        $value = $isTemplate ? '' : ($child[$field['name']] ?? '');
        admin_render_field($field, $value, $prefix);
    }
    echo '</div>';
    echo '<button type="button" class="danger remove-child" title="Remove">&times;</button>';
    echo '</div>';
}
