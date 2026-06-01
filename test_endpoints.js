const BACKEND = 'https://neurobuddy-backend.onrender.com';

async function testEndpoint(name, endpoint, body) {
  try {
    console.log(`\nTesting ${name}...`);
    const res = await fetch(`${BACKEND}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      console.error(`❌ ${name} failed: ${res.status}`);
      console.error(await res.text());
      return false;
    }
    const data = await res.json();
    console.log(`✅ ${name} succeeded. Result length:`, JSON.stringify(data.result).length);
    if (name === 'Detect Subject') {
        console.log(`Subject: ${data.result}`);
    }
    return true;
  } catch (e) {
    console.error(`❌ ${name} exception:`, e.message);
    return false;
  }
}

async function runTests() {
  console.log("Checking Health...");
  try {
    const health = await fetch(`${BACKEND}/api/health`);
    console.log("Health:", await health.json());
  } catch (e) {
    console.error("Health check failed:", e.message);
  }

  await testEndpoint('Detect Subject', '/api/detect-subject', { text: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.", level: "High School" });
  await testEndpoint('Summarize', '/api/summarize', { text: "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to intelligence of humans and other animals. Example tasks in which this is done include speech recognition, computer vision, translation between (natural) languages, as well as other mappings of inputs.", level: "General" });
  await testEndpoint('Quiz', '/api/quiz', { text: "Basic Python programming", level: "Beginner" });
  await testEndpoint('Flashcards', '/api/flashcards', { text: "Capitals of the world", level: "General" });
  await testEndpoint('Mindmap', '/api/mindmap', { text: "Machine Learning", level: "College" });
  await testEndpoint('ArXiv', '/api/arxiv', { text: "attention is all you need", level: "College" });
  await testEndpoint('Story Mode', '/api/storymode', { text: "How water freezes into ice", level: "Elementary" });
  await testEndpoint('Code Pair', '/api/code-pair', { text: "Code:\ndef add(a, b): return a - b\n\nQuestion:\nWhy is this returning the wrong sum?", level: "General" });
}

runTests();
