const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');
const axios = require('axios');
const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

// Load actual TS modules, replacing only explicit dependencies. Network calls
// to PHP are redirected to a local HTTP fixture, never to a real recipient.
function loader(overrides = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const nodeRequire = createRequire(filename);
    const requireLocal = id => {
      if (Object.hasOwn(overrides, id)) return overrides[id];
      const candidate = id.startsWith('@/') ? path.resolve('src', id.slice(2))
        : id.startsWith('.') ? path.resolve(path.dirname(filename), id) : null;
      return candidate && existsSync(`${candidate}.ts`) ? load(`${candidate}.ts`) : nodeRequire(id);
    };
    const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText;
    new Function('require', 'module', 'exports', 'console', source)(requireLocal, module, module.exports, { log() {}, error() {} });
    return module.exports;
  }
  return load;
}

const member = { uid: 'local-test', name: 'Test Member', email: 'member@example.invalid', memberId: '26TM3000100',
  memberSince: '2026-09-22T15:46:28.230Z', communityName: 'Test', bloodGroup: 'AB-', location: 'Test location',
  photoURL: '', residencyStatus: 'NRI', isVerified: false };
const tinyPdf = Buffer.from('%PDF-1.7\nfixture');

function fakeProvider(status, data) {
  const calls = [];
  const load = loader({ axios: { post: async (...args) => {
    calls.push(args); return { status, data, headers: { 'content-type': 'application/json' } };
  } } });
  return { calls, ...load('src/lib/services/verificationEmailProvider.ts') };
}

test('real PDF survives Axios multipart serialization under Next image restrictions', async () => {
  sharp.block({ operation: ['VipsForeignLoad'] });
  sharp.unblock({ operation: ['VipsForeignLoadHeif', 'VipsForeignLoadJpeg', 'VipsForeignLoadNsgif',
    'VipsForeignLoadPng', 'VipsForeignLoadTiff', 'VipsForeignLoadWebp'] });
  let wire;
  const server = createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    wire = { bytes: Buffer.concat(chunks), headers: req.headers };
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ status: true, message: 'Accepted' }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const load = loader({ axios: { post: (url, form, options) => {
      assert.equal(url, 'https://svsamiti.com/prabasiodia/verification.php');
      return axios.post(`http://127.0.0.1:${server.address().port}`, form, options);
    } } });
    const { generateMemberCardPDF } = load('src/lib/services/memberCardPDF.ts');
    const { resolveMemberCardInput } = load('src/lib/services/memberCardData.ts');
    const { createVerificationForm, sendVerificationForm } = load('src/lib/services/verificationEmailProvider.ts');
    const png = await sharp({ create: { width: 30, height: 40, channels: 3, background: '#a23b51' } }).png().toBuffer();
    const pdf = await generateMemberCardPDF(resolveMemberCardInput({ ...member, isVerified: true,
      photoURL: `data:image/png;base64,${png.toString('base64')}` }, 'https://prabasiodia.svsamiti.com'));
    assert.equal((await sendVerificationForm(createVerificationForm(member, pdf))).success, true);
    assert.equal(Number(wire.headers['content-length']), wire.bytes.length);
    assert.equal(wire.headers['transfer-encoding'], undefined);
    assert.ok(wire.bytes.subarray(-4).equals(Buffer.from('--\r\n')));
    const form = await new Request('http://fixture.test', { method: 'POST',
      headers: { 'content-type': wire.headers['content-type'] }, body: wire.bytes }).formData();
    assert.deepEqual([...form.keys()], ['name', 'email', 'member_id', 'member_since', 'community_name', 'member_card_path']);
    assert.equal(form.get('member_since'), '22-09-2026');
    const base64 = form.get('member_card_path');
    assert.match(base64, /^[A-Za-z0-9+/]+={0,2}$/);
    assert.deepEqual(Buffer.from(base64, 'base64'), pdf);
    const document = await PDFDocument.load(Buffer.from(base64, 'base64'));
    assert.equal(document.getPageCount(), 2);
    assert.ok(document.getTitle().includes(member.memberId));
    await assert.rejects(sharp(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')).png().toBuffer());
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('provider accepts JSON with BOM but never contradictory success flags', async () => {
  const good = fakeProvider(200, '\uFEFF{"status":true,"message":"Sent"}');
  assert.equal((await good.sendVerificationForm(good.createVerificationForm(member, tinyPdf))).success, true);
  for (const flags of [{ status: false }, { success: false }, { status: false, success: true }, { status: true, success: false }]) {
    const api = fakeProvider(200, JSON.stringify(flags));
    assert.equal((await api.sendVerificationForm(api.createVerificationForm(member, tinyPdf))).success, false);
    assert.equal(api.calls.length, 1);
  }
});

test('HTTP 406 and HTML responses remain failures with useful messages', async () => {
  for (const [status, data] of [[406, '<html>Not Acceptable</html>'], [500, '<html>Server error</html>'], [200, 'null']]) {
    const api = fakeProvider(status, data);
    const result = await api.sendVerificationForm(api.createVerificationForm(member, tinyPdf));
    assert.equal(result.success, false);
    assert.match(result.message, new RegExp(`HTTP ${status}`));
    assert.equal(api.calls.length, 1);
  }
  const api = fakeProvider(200, '{"status":false,"errors":["Attachment rejected"]}');
  assert.equal((await api.sendVerificationForm(api.createVerificationForm(member, tinyPdf))).message, 'Attachment rejected');
});

test('preparation returns Base64 fields for pending members without contacting PHP', async () => {
  let sent = false;
  const load = loader({
    axios: { post: () => { sent = true; throw new Error('Unexpected email'); } },
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/services/memberCardPDF': { generateMemberCardPDF: async () => tinyPdf },
  });
  const { POST } = load('src/app/api/email/verification/route.ts');
  const response = await POST(new Request('http://local.test/api/email/verification?prepareOnly=1', {
    method: 'POST', body: JSON.stringify(member),
  }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = await response.json();
  assert.equal(result.success, true);
  assert.equal(result.fields.member_card_path, tinyPdf.toString('base64'));
  assert.equal(result.fields.member_since, '22-09-2026');
  assert.equal(Object.keys(result.fields).length, 6);
  assert.equal(sent, false);
});

function proxyClient({ status = 200, body = { status: true }, requestError } = {}) {
  const calls = [];
  const client = async options => {
    calls.push(options);
    if (requestError) throw requestError;
    return { status, data: body };
  };
  return { calls, service: loader({ axios: client })('src/lib/services/emailService.ts').emailService };
}

async function withMockFetch(mock, callback) {
  const original = global.fetch;
  global.fetch = mock;
  try { return await callback(); } finally { global.fetch = original; }
}

test('client prepares the PDF then sends the PHP JSON attachment contract directly', async () => {
  const api = proxyClient({ body: { success: true, fields: {
    name: member.name, email: member.email, member_id: member.memberId,
    member_since: '22-09-2026', community_name: member.communityName,
    member_card_path: tinyPdf.toString('base64'),
  } } });
  const directCalls = [];
  const result = await withMockFetch(async (url, options) => {
    directCalls.push({ url, options });
    return new Response(JSON.stringify({ status: true }), { status: 200 });
  }, () => api.service.sendVerificationEmail(member));
  assert.equal(result.success, true);
  assert.equal(api.calls.length, 1);
  assert.equal(api.calls[0].url, '/api/email/verification?prepareOnly=1');
  assert.equal(api.calls[0].data.uid, member.uid);
  assert.equal(api.calls[0].data.memberId, member.memberId);
  assert.equal(api.calls[0].data.email, member.email);
  assert.equal(api.calls[0].headers['x-api-key'], undefined);
  assert.equal(directCalls.length, 1);
  assert.equal(directCalls[0].url, 'https://svsamiti.com/prabasiodia/verification.php');
  assert.equal(directCalls[0].options.method, 'POST');
  assert.equal(directCalls[0].options.credentials, 'omit');
  assert.equal(directCalls[0].options.headers['Content-Type'], 'application/json');
  const providerPayload = JSON.parse(directCalls[0].options.body);
  assert.equal(providerPayload.member_since, '2026-09-22');
  assert.equal(providerPayload.member_card_path, `data:application/pdf;base64,${tinyPdf.toString('base64')}`);
});

test('client preserves server failure messages without automatic retries', async () => {
  for (const message of ['Could not generate the member-card PDF.', 'Provider rejected request (HTTP 406).']) {
    const api = proxyClient({ requestError: { response: { data: { message } } } });
    const result = await api.service.sendVerificationEmail(member);
    assert.equal(result.success, false);
    assert.equal(result.message, message);
    assert.equal(api.calls.length, 1);
  }
});

test('failed preparation responses fail without retrying the mail provider', async () => {
  for (const options of [
    { status: 406, body: '<html>Not Acceptable</html>' },
    { status: 500, body: '{"status":true}' },
    { body: '{"status":true,"success":false}' },
    { body: '{"status":false,"message":"Attachment missing"}' },
    { body: '<html>Success?</html>' },
    { requestError: new Error('Network Error') },
  ]) {
    const api = proxyClient(options);
    const result = await api.service.sendVerificationEmail(member);
    assert.equal(result.success, false);
    assert.equal(api.calls.length, 1);
    assert.equal(api.calls[0].url, '/api/email/verification?prepareOnly=1');
    if (options.status === 406) assert.match(result.message, /prepare the member-card attachment/);
    if (options.requestError) assert.match(result.message, /Could not contact the email provider directly/);
  }
  const api = proxyClient({ body: { success: true, fields: { name: member.name } } });
  const result = await withMockFetch(async () => new Response('\uFEFF{"status":true}', { status: 200 }), () => api.service.sendVerificationEmail(member));
  assert.equal(result.success, true);
});

test('invalid PDF is rejected before sending', () => {
  const api = fakeProvider(200, '{}');
  assert.throws(() => api.createVerificationForm(member, Buffer.from('https://svsamiti.com/')), /valid PDF/);
  assert.equal(api.calls.length, 0);
});

test('route stops on PDF failure and does not invoke PHP', async () => {
  let sent = false;
  const load = loader({
    'next/server': { NextResponse: { json: (data, init) => Response.json(data, init) } },
    '@/lib/services/memberCardPDF': { generateMemberCardPDF: async () => { throw new Error('Cannot render'); } },
    '@/lib/services/verificationEmailProvider': { sendVerificationForm: () => { sent = true; } },
  });
  const { POST } = load('src/app/api/email/verification/route.ts');
  const response = await POST(new Request('http://local.test', { method: 'POST', body: JSON.stringify(member) }));
  assert.equal(response.status, 500);
  assert.equal((await response.json()).success, false);
  assert.equal(sent, false);
});

// Exercise the real click handler with isolated effects; no browser, database,
// or Firestore credentials are needed to test approval ordering and the lock.
function clickHandler(send) {
  const source = ts.createSourceFile('modal.tsx', readFileSync('src/components/admin/users/UserVerificationModal/index.tsx', 'utf8'),
    ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'handleVerify') initializer = node.initializer.getText(source);
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(initializer);
  const events = [];
  const dependencies = {
    user: { ...member, currentCity: 'Test', nearbyCommunityId: 'test-community' },
    approvalInFlight: { current: false }, isVerifying: false, isSendingVerificationEmail: false,
    memberId: member.memberId, communityAction: 'auto', selectedCommunityId: '', communities: [],
    setIsApproving() {}, setVerificationError: error => events.push(['error', error]),
    deliverVerificationEmail: async () => { events.push(['send']); return send(); },
    onVerify: async () => { events.push(['approve']); return { success: true }; },
    log: async () => { events.push(['log']); }, onClose: () => events.push(['close']),
    ActivityActions: { VERIFY: 'verify' }, ActivityEntityTypes: { USER: 'user' },
    toast: { success() {}, error: error => events.push(['error', error]) },
  };
  const compiled = ts.transpileModule(`const handler = ${initializer};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return { events, run: new Function(...Object.keys(dependencies), `${compiled}; return handler;`)(...Object.values(dependencies)) };
}

test('Verify approves and closes only after confirmed email success', async () => {
  const pass = clickHandler(async () => true);
  await pass.run();
  assert.deepEqual(pass.events.map(e => e[0]), ['send', 'approve', 'log', 'close']);
  const fail = clickHandler(async () => false);
  await fail.run();
  assert.deepEqual(fail.events.map(e => e[0]), ['send']);
});

test('repeated Verify clicks cannot send or approve twice while mail is running', async () => {
  let resolve;
  const pending = new Promise(r => { resolve = r; });
  const handler = clickHandler(() => pending);
  const first = handler.run();
  await handler.run();
  assert.deepEqual(handler.events.map(e => e[0]), ['send']);
  resolve(true);
  await first;
  assert.deepEqual(handler.events.map(e => e[0]), ['send', 'approve', 'log', 'close']);
});
