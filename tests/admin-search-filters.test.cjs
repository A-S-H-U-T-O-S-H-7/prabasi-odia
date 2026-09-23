const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const { JSDOM } = require('jsdom');

// DOM-only tests: no browser session, network, authentication, or database.
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.IS_REACT_ACT_ENVIRONMENT = true;
const React = require('react');
const { act } = React;
const { createRoot } = require('react-dom/client');

const modules = new Map();
function load(filename) {
  filename = path.resolve(filename);
  if (modules.has(filename)) return modules.get(filename).exports;
  const module = { exports: {} };
  modules.set(filename, module);
  const nodeRequire = createRequire(filename);
  const requireLocal = id => {
    const candidate = id.startsWith('@/') ? path.resolve('src', id.slice(2))
      : id.startsWith('.') ? path.resolve(path.dirname(filename), id) : null;
    if (candidate) for (const extension of ['.tsx', '.ts']) {
      if (existsSync(candidate + extension)) return load(candidate + extension);
    }
    return nodeRequire(id);
  };
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', compiled)(requireLocal, module, module.exports);
  return module.exports;
}
const Toolbar = load('src/components/admin/common/AdminSearchFilters.tsx').default;
const defaults = { searchTerm: '', setSearchTerm() {}, onSearch() {}, onClear() {},
  placeholder: 'Search test records', children: React.createElement('button', { type: 'button' }, 'Pending') };

async function mount(Component = Toolbar, props = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  await act(async () => root.render(React.createElement(Component, { ...defaults, ...props })));
  return { host, dispose: async () => { await act(async () => root.unmount()); host.remove(); } };
}

test('search input, Search and Clear are one form; Filter is a separate labeled block', async () => {
  const view = await mount();
  try {
    const form = view.host.querySelector('form[role="search"]');
    assert.ok(form);
    assert.deepEqual([...form.querySelectorAll('input, button')].map(element =>
      element.tagName === 'INPUT' ? 'input' : element.textContent), ['input', 'Search', 'Clear']);
    assert.equal(form.querySelector('button[type="submit"]').textContent, 'Search');
    assert.equal(form.querySelector('button[type="button"]').textContent, 'Clear');
    assert.ok(form.querySelector('input').getAttribute('aria-label'));
    const filters = view.host.querySelector('[role="group"][aria-label="Filter"]');
    assert.ok(filters.textContent.includes('Filter'));
    assert.equal(form.contains(filters), false);
    assert.equal(filters.querySelector('button').textContent, 'Pending');
    assert.ok(form.className.includes('flex-wrap')); // Narrow layouts can wrap within the block.
  } finally { await view.dispose(); }
});

test('typing only updates the draft; submitting the form applies the search', async () => {
  const edits = [];
  let searches = 0;
  const view = await mount(Toolbar, { setSearchTerm: value => edits.push(value), onSearch: () => { searches++; } });
  try {
    const input = view.host.querySelector('input');
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, 'Bengaluru');
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
    });
    assert.deepEqual(edits, ['Bengaluru']);
    assert.equal(searches, 0);
    await act(async () => view.host.querySelector('form').requestSubmit());
    assert.equal(searches, 1);
  } finally { await view.dispose(); }
});

test('Clear is always visible, does not submit, and returns focus to the input', async () => {
  let clears = 0;
  let searches = 0;
  const view = await mount(Toolbar, { searchTerm: 'Test', onClear: () => { clears++; }, onSearch: () => { searches++; } });
  try {
    await act(async () => view.host.querySelector('form button[type="button"]').click());
    assert.equal(clears, 1);
    assert.equal(searches, 0);
    assert.equal(document.activeElement, view.host.querySelector('input'));
  } finally { await view.dispose(); }
});

test('pending searches disable actions and suppress repeated submissions', async () => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  let calls = 0;
  const view = await mount(Toolbar, { onSearch: () => { calls++; return pending; } });
  try {
    const form = view.host.querySelector('form');
    await act(async () => {
      form.requestSubmit();
      form.requestSubmit();
    });
    assert.equal(calls, 1);
    assert.ok([...form.querySelectorAll('input, button')].every(element => element.disabled));
    await act(async () => resolve());
    assert.ok([...form.querySelectorAll('input, button')].every(element => !element.disabled));
  } finally { await view.dispose(); }
});

test('all five dedicated filter components use the shared layout and retain filter actions', async () => {
  for (const filename of ['users/UserFilters', 'registered-users/RegisteredUserFilters',
    'communities/CommunityFilters', 'events/EventFilters', 'notices/NoticeFilters']) {
    const changes = [];
    const Component = load(`src/components/admin/${filename}.tsx`).default;
    const view = await mount(Component, { statusFilter: 'all', setStatusFilter: value => changes.push(value),
      priorityFilter: 'all', setPriorityFilter: value => changes.push(value) });
    try {
      assert.equal(view.host.querySelectorAll('form[role="search"]').length, 1);
      const filters = view.host.querySelector('[role="group"][aria-label="Filter"]');
      assert.ok(filters, filename);
      await act(async () => filters.querySelectorAll('button')[1].click());
      assert.equal(changes.length, 1, filename);
    } finally { await view.dispose(); }
  }
});

test('all nine searchable admin pages wire Search, Clear and loading to the shared controls', () => {
  const files = ['users/Users', 'registered-users/RegisteredUsers', 'communities/Communities',
    'events/Events', 'notices/Notices', 'jobs/Jobs', 'urgent-help/UrgentHelp', 'donations/Donations']
    .map(name => `src/components/admin/${name}.tsx`);
  files.push('src/app/(admin)/admin/activity/page.tsx');
  for (const filename of files) {
    const source = readFileSync(filename, 'utf8');
    const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const controls = [];
    function visit(node) {
      if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
          /^(AdminSearchFilters|UserFilters|RegisteredUserFilters|CommunityFilters|EventFilters|NoticeFilters)$/.test(node.tagName.getText(ast))) {
        controls.push(node);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    assert.equal(controls.length, 1, filename);
    const attributes = controls[0].attributes.properties.map(property => property.name?.getText(ast));
    for (const name of ['onSearch', 'onClear', 'isSearching']) assert.ok(attributes.includes(name), `${filename}: ${name}`);
    assert.equal(source.includes('onClick={handleSearch}'), false, filename);
  }
});
