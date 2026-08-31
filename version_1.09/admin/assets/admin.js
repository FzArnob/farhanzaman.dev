/* Content admin: tabs, add/remove rows, live card titles, unsaved-changes guard. */
(function () {
  'use strict';

  var form = document.getElementById('editor');
  if (!form) return;

  /** Unique suffix for freshly added rows, so their input names never collide. */
  var nextIndex = Date.now() % 100000;

  // ------------------------------------------------------------------ tabs

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.panel'));

  function showTab(name) {
    tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.target === name);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle('active', panel.dataset.section === name);
    });
    try {
      localStorage.setItem('admin.tab', name);
    } catch (error) {
      /* private mode */
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      showTab(tab.dataset.target);
    });
  });

  var stored = null;
  try {
    stored = localStorage.getItem('admin.tab');
  } catch (error) {
    /* private mode */
  }
  var initial = tabs.some(function (t) { return t.dataset.target === stored; })
    ? stored
    : (tabs[0] && tabs[0].dataset.target);
  // An error list means something needs fixing — start on the first section.
  if (document.querySelector('.banner.error')) initial = tabs[0].dataset.target;
  if (initial) showTab(initial);

  // ------------------------------------------------------------- utilities

  function sectionOf(element) {
    var panel = element.closest('.panel');
    return panel ? panel.dataset.section : null;
  }

  function refreshCount(section) {
    var list = document.querySelector('[data-list="' + section + '"]');
    if (!list) return;
    var total = list.querySelectorAll(':scope > .item').length;
    var badge = document.querySelector('[data-count-for="' + section + '"]');
    if (badge) badge.textContent = total;
    var empty = document.querySelector('[data-empty-for="' + section + '"]');
    if (empty) empty.classList.toggle('hidden', total > 0);
  }

  function refreshChildCount(container) {
    var head = container.querySelector('.children-head .count');
    if (head) head.textContent = container.querySelectorAll('.child').length;
  }

  /** Keeps the collapsed card header in step with the fields inside it. */
  function bindTitleSync(item) {
    var titleEl = item.querySelector('[data-role="title"]');
    var subtitleEl = item.querySelector('[data-role="subtitle"]');
    var inputs = item.querySelectorAll('.item-body > .grid > .field input, .item-body > .grid > .field textarea');
    if (!inputs.length) return;

    var titleInput = inputs[0];
    var subtitleInput = inputs[1];

    function sync() {
      if (titleEl) titleEl.textContent = titleInput.value.trim() || 'Untitled';
      if (subtitleEl && subtitleInput) subtitleEl.textContent = subtitleInput.value.trim();
      item.dataset.search = (
        (titleInput.value || '') + ' ' + (subtitleInput ? subtitleInput.value : '')
      ).toLowerCase();
    }

    titleInput.addEventListener('input', sync);
    if (subtitleInput) subtitleInput.addEventListener('input', sync);
  }

  document.querySelectorAll('.item').forEach(bindTitleSync);

  // --------------------------------------------------------- add and remove

  document.addEventListener('click', function (event) {
    var target = event.target;

    // Collapse / expand
    var head = target.closest('.item-head');
    if (head && !target.closest('.remove')) {
      head.parentElement.classList.toggle('open');
      return;
    }

    // Add a top level item
    var addButton = target.closest('.add-item');
    if (addButton) {
      var section = addButton.dataset.section;
      var template = document.getElementById('tpl-' + section);
      var list = document.querySelector('[data-list="' + section + '"]');
      if (!template || !list) return;

      var index = nextIndex++;
      var html = template.innerHTML
        .split('__INDEX__').join(index)
        .split('__PINDEX__').join(index);
      var holder = document.createElement('div');
      holder.innerHTML = html;
      var item = holder.firstElementChild;
      item.classList.add('open');
      list.appendChild(item);
      bindTitleSync(item);
      refreshCount(section);
      markDirty();
      var first = item.querySelector('input:not([type=hidden]), textarea, select');
      if (first) first.focus();
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Remove a top level item
    var removeButton = target.closest('.remove');
    if (removeButton) {
      var item2 = removeButton.closest('.item');
      var label = item2.querySelector('[data-role="title"]');
      var name = label ? label.textContent.trim() : 'this entry';
      if (!window.confirm('Remove "' + name + '"? It is deleted when you save.')) return;
      var section2 = sectionOf(item2);
      item2.remove();
      refreshCount(section2);
      markDirty();
      return;
    }

    // Add a nested item (project media)
    var addChild = target.closest('.add-child');
    if (addChild) {
      var group = addChild.closest('.children');
      var parentItem = addChild.closest('.item');
      var childName = group.dataset.child;
      var childTemplate = document.getElementById('tpl-' + sectionOf(parentItem) + '-' + childName);
      if (!childTemplate) return;

      var childHtml = childTemplate.innerHTML
        .split('__PINDEX__').join(parentItem.dataset.index)
        .split('__MINDEX__').join(nextIndex++);
      var childHolder = document.createElement('div');
      childHolder.innerHTML = childHtml;
      group.querySelector('.children-list').appendChild(childHolder.firstElementChild);
      refreshChildCount(group);
      markDirty();
      return;
    }

    // Remove a nested item
    var removeChild = target.closest('.remove-child');
    if (removeChild) {
      var childGroup = removeChild.closest('.children');
      removeChild.closest('.child').remove();
      refreshChildCount(childGroup);
      markDirty();
      return;
    }

    // Expand / collapse everything in a panel
    var expandAll = target.closest('.expand-all');
    if (expandAll) {
      var panel = expandAll.closest('.panel');
      var items = panel.querySelectorAll('.item');
      var shouldOpen = expandAll.textContent.indexOf('Expand') === 0;
      items.forEach(function (node) {
        node.classList.toggle('open', shouldOpen);
      });
      expandAll.textContent = shouldOpen ? 'Collapse all' : 'Expand all';
    }
  });

  // ----------------------------------------------------------------- filter

  document.querySelectorAll('.search').forEach(function (input) {
    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();
      var list = document.querySelector('[data-list="' + input.dataset.searchFor + '"]');
      if (!list) return;
      list.querySelectorAll(':scope > .item').forEach(function (item) {
        var match = term === '' || (item.dataset.search || '').indexOf(term) !== -1;
        item.classList.toggle('hidden', !match);
      });
    });
  });

  // -------------------------------------------------- unsaved changes guard

  var dirty = false;
  var flag = document.getElementById('dirty-flag');

  function markDirty() {
    if (dirty) return;
    dirty = true;
    if (flag) flag.classList.remove('hidden');
  }

  form.addEventListener('input', markDirty);
  form.addEventListener('change', markDirty);
  form.addEventListener('submit', function () {
    dirty = false;
  });

  window.addEventListener('beforeunload', function (event) {
    if (!dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  // Ctrl/Cmd + S saves.
  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      form.requestSubmit();
    }
  });
})();
