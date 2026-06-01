const BACKEND = 'https://neurobuddy-backend.onrender.com';
const FRONTEND = 'https://neurobuddy-hegt.onrender.com';

const results = [];

async function check(label, fn) {
  try {
    const start = Date.now();
    const result = await fn();
    const ms = Date.now() - start;
    results.push({ label, status: '✅ PASS', ms, detail: result });
    console.log(`✅ ${label} (${ms}ms): ${JSON.stringify(result).slice(0, 120)}`);
  } catch (e) {
    results.push({ label, status: '❌ FAIL', detail: e.message });
    console.log(`❌ ${label}: ${e.message}`);
  }
}

async function postJSON(endpoint, body) {
  const res = await fetch(`${BACKEND}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function run() {
  console.log('='.repeat(60));
  console.log('🚀 NeuroBuddy Live Deployment Check');
  console.log('='.repeat(60));
  console.log(`Backend:  ${BACKEND}`);
  console.log(`Frontend: ${FRONTEND}`);
  console.log('='.repeat(60));
  console.log('');

  // 1. Backend Health
  await check('Backend /api/health', async () => {
    const res = await fetch(`${BACKEND}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Status not ok');
    if (!data.key_set) throw new Error('Gemini API key not set!');
    if (!data.sdk_available) throw new Error('Gemini SDK not available!');
    return data;
  });

  // 2. Frontend reachable
  await check('Frontend page loads', async () => {
    const res = await fetch(FRONTEND);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (!html.includes('<html') && !html.includes('<!DOCTYPE')) throw new Error('No HTML returned');
    return { title: 'HTML page loaded', bytes: html.length };
  });

  // 3. CORS check - frontend can call backend
  await check('CORS: Frontend origin allowed by Backend', async () => {
    const res = await fetch(`${BACKEND}/api/health`, {
      headers: { 'Origin': FRONTEND }
    });
    const corsHeader = res.headers.get('access-control-allow-origin');
    if (!corsHeader) throw new Error('No CORS header returned - frontend will be BLOCKED!');
    return { 'allow-origin': corsHeader };
  });

  // 4. Detect Subject
  await check('API: /api/detect-subject', async () => {
    const data = await postJSON('/api/detect-subject', { text: 'Photosynthesis converts sunlight into glucose', level: 'General' });
    if (!data.result) throw new Error('No result returned');
    return { subject: data.result };
  });

  // 5. Summarize
  await check('API: /api/summarize', async () => {
    const data = await postJSON('/api/summarize', { text: 'Artificial intelligence is the simulation of human intelligence by machines. It includes machine learning, deep learning, and neural networks. AI is used in many applications like self-driving cars, image recognition, and natural language processing.', level: 'General' });
    if (!data.result) throw new Error('No result returned');
    return { length: data.result.length };
  });

  // 6. Quiz
  await check('API: /api/quiz', async () => {
    const data = await postJSON('/api/quiz', { text: 'Python basics', level: 'General' });
    if (!data.result) throw new Error('No result returned');
    const parsed = JSON.parse(data.result.match(/\[[\s\S]*\]/)?.[0] || data.result);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Quiz not an array');
    return { questions: parsed.length, first: parsed[0]?.q?.slice(0, 60) };
  });

  // 7. Flashcards
  await check('API: /api/flashcards', async () => {
    const data = await postJSON('/api/flashcards', { text: 'Solar System', level: 'General' });
    if (!data.result) throw new Error('No result returned');
    return { length: data.result.length };
  });

  // 8. Story Mode
  await check('API: /api/storymode', async () => {
    const data = await postJSON('/api/storymode', { text: 'How rain forms', level: 'Grade 1-10' });
    if (!data.result) throw new Error('No result returned');
    return { words: data.result.split(' ').length };
  });

  // 9. Mindmap
  await check('API: /api/mindmap', async () => {
    const data = await postJSON('/api/mindmap', { text: 'Photosynthesis', level: 'High School' });
    if (!data.result) throw new Error('No result returned');
    if (!data.result.includes('mindmap')) throw new Error('Response does not look like a Mermaid mindmap');
    return { length: data.result.length };
  });

  // 10. ArXiv
  await check('API: /api/arxiv', async () => {
    const data = await postJSON('/api/arxiv', { text: 'attention mechanism transformers', level: 'BTech' });
    if (!data.result) throw new Error('No result returned');
    return { length: data.result.length };
  });

  // 11. Code Pair
  await check('API: /api/code-pair', async () => {
    const data = await postJSON('/api/code-pair', { text: 'Code:\ndef add(a,b): return a-b\n\nQuestion:\nWhy is this wrong?', level: 'General' });
    if (!data.result) throw new Error('No result returned');
    return { length: data.result.length };
  });

  console.log('');
  console.log('='.repeat(60));
  const passed = results.filter(r => r.status.includes('PASS')).length;
  const failed = results.filter(r => r.status.includes('FAIL')).length;
  console.log(`📊 FINAL RESULTS: ${passed}/${results.length} passed, ${failed} failed`);
  console.log('='.repeat(60));
  results.forEach(r => {
    console.log(`${r.status} ${r.label}${r.ms ? ` (${r.ms}ms)` : ''}`);
  });

  if (failed === 0) {
    console.log('\n🎉 ALL SYSTEMS GREEN — Your app is fully production-ready!');
  } else {
    console.log(`\n⚠️  ${failed} check(s) failed. Review the errors above.`);
  }
}

run();
