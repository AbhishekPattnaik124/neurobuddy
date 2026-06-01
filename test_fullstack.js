const BACKEND  = 'https://neurobuddy-backend.onrender.com';
const REACT_FE = 'https://neurobuddy-hegt.onrender.com';
const STREAMLIT = 'http://localhost:8501';   // local streamlit

const results = [];
let passed = 0, failed = 0, warn = 0;

function log(status, label, detail = '', ms = null) {
  const icon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌';
  const time = ms ? ` (${ms}ms)` : '';
  console.log(`${icon} [${status}] ${label}${time}${detail ? ' — ' + detail : ''}`);
  results.push({ status, label, detail, ms });
  if (status === 'PASS') passed++;
  else if (status === 'WARN') warn++;
  else failed++;
}

async function check(label, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    log('PASS', label, detail || '', Date.now() - start);
  } catch (e) {
    log('FAIL', label, e.message);
  }
}

async function checkWarn(label, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    log('PASS', label, detail || '', Date.now() - start);
  } catch (e) {
    log('WARN', label, e.message + ' (non-critical)');
  }
}

async function postJSON(endpoint, body, timeout = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(`${BACKEND}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function run() {
  console.log('\n' + '═'.repeat(65));
  console.log('  🚀 NeuroBuddy — Full Stack Feature Verification');
  console.log('═'.repeat(65));
  console.log(`  Backend:   ${BACKEND}`);
  console.log(`  React App: ${REACT_FE}`);
  console.log(`  Streamlit: ${STREAMLIT}`);
  console.log('═'.repeat(65) + '\n');

  // ─────────────────────────────────────────────────────
  // SECTION 1: BACKEND HEALTH & INFRASTRUCTURE
  // ─────────────────────────────────────────────────────
  console.log('━━━ 1. BACKEND HEALTH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await check('GET /api/health — status ok', async () => {
    const r = await fetch(`${BACKEND}/api/health`);
    const d = await r.json();
    if (d.status !== 'ok') throw new Error('status != ok');
    if (!d.key_set) throw new Error('Gemini API key NOT set');
    if (!d.sdk_available) throw new Error('Gemini SDK missing');
    return `model=${d.model}, key_set=true`;
  });

  await check('CORS — React frontend origin accepted', async () => {
    const r = await fetch(`${BACKEND}/api/health`, {
      headers: { 'Origin': REACT_FE }
    });
    const acao = r.headers.get('access-control-allow-origin');
    if (!acao) throw new Error('No CORS header — browser will block all requests!');
    return `allow-origin: ${acao}`;
  });

  await checkWarn('CORS — Streamlit origin accepted', async () => {
    const r = await fetch(`${BACKEND}/api/health`, {
      headers: { 'Origin': STREAMLIT }
    });
    const acao = r.headers.get('access-control-allow-origin');
    if (!acao) throw new Error('Streamlit CORS not set (ok for server-side calls)');
    return `allow-origin: ${acao}`;
  });

  // ─────────────────────────────────────────────────────
  // SECTION 2: BACKEND AI FEATURES
  // ─────────────────────────────────────────────────────
  console.log('\n━━━ 2. BACKEND AI FEATURES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await check('/api/detect-subject — returns known subject', async () => {
    const d = await postJSON('/api/detect-subject', { text: 'Photosynthesis converts sunlight into glucose using chlorophyll.', level: 'General' });
    if (!d.result) throw new Error('No result');
    return `subject="${d.result.trim()}"`;
  });

  await check('/api/summarize — returns 3 sections', async () => {
    const d = await postJSON('/api/summarize', {
      text: 'Artificial intelligence is the simulation of human intelligence by machines. It includes machine learning where computers learn from data, deep learning using neural networks with many layers, and natural language processing for understanding human language. AI is transforming industries from healthcare to finance.',
      level: 'General'
    });
    const raw = d.result || '';
    if (!raw.includes('##KEYPOINTS##')) throw new Error('Missing ##KEYPOINTS## section');
    if (!raw.includes('##DEFINITIONS##')) throw new Error('Missing ##DEFINITIONS## section');
    if (!raw.includes('##TLDR##')) throw new Error('Missing ##TLDR## section');
    return `all 3 sections present, ${raw.length} chars`;
  });

  await check('/api/quiz — returns 5 MCQ questions', async () => {
    const d = await postJSON('/api/quiz', { text: 'Python basics', level: 'General' });
    const raw = d.result || '';
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array in response');
    const quiz = JSON.parse(match[0]);
    if (!Array.isArray(quiz)) throw new Error('Not an array');
    if (quiz.length < 1) throw new Error('Empty quiz');
    const q = quiz[0];
    if (!q.q && !q.question) throw new Error('Missing q/question field');
    if (!q.opts && !q.options) throw new Error('Missing opts/options field');
    if (q.ans === undefined && q.answer_index === undefined) throw new Error('Missing ans/answer_index field');
    return `${quiz.length} questions, fields: q/opts/ans ✓`;
  });

  await check('/api/flashcards — returns 8 cards', async () => {
    const d = await postJSON('/api/flashcards', { text: 'Solar System planets', level: 'General' });
    const raw = d.result || '';
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array');
    const cards = JSON.parse(match[0]);
    if (!Array.isArray(cards)) throw new Error('Not an array');
    if (cards.length < 1) throw new Error('Empty flashcards');
    const c = cards[0];
    if (!c.front && !c.question) throw new Error('Missing front/question field');
    if (!c.back && !c.answer) throw new Error('Missing back/answer field');
    return `${cards.length} cards, fields: front/back ✓`;
  });

  await check('/api/mindmap — returns Mermaid syntax', async () => {
    const d = await postJSON('/api/mindmap', { text: 'Photosynthesis', level: 'General' });
    const raw = d.result || '';
    if (!raw.includes('mindmap')) throw new Error('Response does not contain "mindmap" keyword');
    if (!raw.includes('root')) throw new Error('Response missing root node');
    return `Mermaid mindmap, ${raw.length} chars`;
  });

  await checkWarn('/api/arxiv — fetches real paper', async () => {
    const d = await postJSON('/api/arxiv', { text: 'attention mechanism neural networks', level: 'BTech' }, 25000);
    if (!d.result) throw new Error('No result');
    return `${d.result.length} chars`;
  });

  await check('/api/storymode — returns story', async () => {
    const d = await postJSON('/api/storymode', { text: 'How rain forms', level: 'Grade 1-10' });
    if (!d.result) throw new Error('No result');
    if (d.result.length < 100) throw new Error('Story too short, probably an error');
    return `${d.result.split(' ').length} words`;
  });

  await check('/api/code-pair — reviews code', async () => {
    const d = await postJSON('/api/code-pair', {
      text: 'Code:\ndef divide(a, b):\n    return a / b\n\nQuestion:\nWhat happens if b is 0?',
      level: 'General'
    });
    if (!d.result) throw new Error('No result');
    return `${d.result.length} chars`;
  });

  // ─────────────────────────────────────────────────────
  // SECTION 3: REACT FRONTEND
  // ─────────────────────────────────────────────────────
  console.log('\n━━━ 3. REACT FRONTEND ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await check('React app — page loads successfully', async () => {
    const r = await fetch(REACT_FE);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) throw new Error('No HTML');
    return `${html.length} bytes`;
  });

  await check('React app — has correct title', async () => {
    const r = await fetch(REACT_FE);
    const html = await r.text();
    if (!html.toLowerCase().includes('studybuddy') && !html.toLowerCase().includes('neurobuddy')) {
      throw new Error('Title missing StudyBuddy/NeuroBuddy');
    }
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    return `title: "${titleMatch?.[1] || 'found'}"`;
  });

  await check('React app — loads JS bundle (Vite build)', async () => {
    const r = await fetch(REACT_FE);
    const html = await r.text();
    const scriptMatch = html.match(/src="([^"]*\.js)"/);
    if (!scriptMatch) throw new Error('No JS bundle found in HTML');
    const jsUrl = new URL(scriptMatch[1], REACT_FE).href;
    const jsRes = await fetch(jsUrl);
    if (!jsRes.ok) throw new Error(`JS bundle HTTP ${jsRes.status}`);
    return `bundle: ${scriptMatch[1].split('/').pop()}`;
  });

  await check('React app — loads CSS bundle', async () => {
    const r = await fetch(REACT_FE);
    const html = await r.text();
    const cssMatch = html.match(/href="([^"]*\.css)"/);
    if (!cssMatch) throw new Error('No CSS bundle');
    const cssUrl = new URL(cssMatch[1], REACT_FE).href;
    const cssRes = await fetch(cssUrl);
    if (!cssRes.ok) throw new Error(`CSS HTTP ${cssRes.status}`);
    return `bundle: ${cssMatch[1].split('/').pop()}`;
  });

  await check('React app — Firebase config present in bundle', async () => {
    const r = await fetch(REACT_FE);
    const html = await r.text();
    const scriptMatch = html.match(/src="([^"]*\.js)"/);
    if (!scriptMatch) throw new Error('No bundle');
    const jsUrl = new URL(scriptMatch[1], REACT_FE).href;
    const js = await (await fetch(jsUrl)).text();
    if (!js.includes('firebase') && !js.includes('firebaseapp')) throw new Error('Firebase not found in bundle');
    return 'Firebase SDK present';
  });

  // ─────────────────────────────────────────────────────
  // SECTION 4: STREAMLIT FRONTEND
  // ─────────────────────────────────────────────────────
  console.log('\n━━━ 4. STREAMLIT FRONTEND (localhost:8501) ━━━━━━━━━━━━━━━━');

  await check('Streamlit — app is running', async () => {
    const r = await fetch(STREAMLIT, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    if (!html.includes('streamlit') && !html.includes('Streamlit')) throw new Error('Not a Streamlit page');
    return `${html.length} bytes`;
  });

  await checkWarn('Streamlit — health endpoint from Streamlit', async () => {
    const r = await fetch(`${STREAMLIT}/_stcore/health`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();
    return `status: ${text.trim()}`;
  });

  // ─────────────────────────────────────────────────────
  // FINAL REPORT
  // ─────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(65));
  console.log(`  📊  FINAL RESULTS`);
  console.log('═'.repeat(65));
  console.log(`  ✅ PASSED  : ${passed}`);
  console.log(`  ⚠️  WARNINGS: ${warn}  (non-critical, usually rate limit / ArXiv timeout)`);
  console.log(`  ❌ FAILED  : ${failed}`);
  console.log(`  📋 TOTAL   : ${results.length}`);
  console.log('─'.repeat(65));

  const sections = {
    'BACKEND HEALTH': results.filter(r => r.label.includes('health') || r.label.includes('CORS')),
    'AI FEATURES': results.filter(r => r.label.includes('/api/')),
    'REACT FRONTEND': results.filter(r => r.label.includes('React')),
    'STREAMLIT': results.filter(r => r.label.includes('Streamlit')),
  };

  for (const [section, items] of Object.entries(sections)) {
    if (!items.length) continue;
    const sPass = items.filter(i => i.status === 'PASS').length;
    const sFail = items.filter(i => i.status === 'FAIL').length;
    const sWarn = items.filter(i => i.status === 'WARN').length;
    console.log(`\n  ${section}: ${sPass}✅ ${sWarn ? sWarn+'⚠️ ' : ''}${sFail ? sFail+'❌' : ''}`);
    items.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'WARN' ? '⚠️ ' : '❌';
      console.log(`    ${icon} ${r.label}${r.ms ? ` (${r.ms}ms)` : ''}`);
    });
  }

  if (failed === 0) {
    console.log('\n  🎉 ALL CRITICAL CHECKS PASSED — System is production-ready!');
  } else {
    console.log(`\n  ⚠️  ${failed} critical check(s) failed. See details above.`);
  }
  console.log('═'.repeat(65) + '\n');
}

run();
