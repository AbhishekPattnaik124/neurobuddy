import { auth } from '../firebase';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://neurobuddy-backend.onrender.com';

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.error('Failed to get Firebase token', e);
    }
  }
  return headers;
}

// ─── Health ──────────────────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${BACKEND}/api/health`);
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Chat (SSE Streaming) ─────────────────────────────────────────
export async function streamChat(messages, onChunk, onDone, onError) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        messages: messages.messages || messages, 
        level: messages.level || 'General',
        uid: auth.currentUser?.uid || null
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail || `Server error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') { onDone?.(); return; }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.text) onChunk(parsed.text);
          if (parsed.error) throw new Error(parsed.error);
        } catch (e) {
          if (e.message !== 'Unexpected end of JSON input') {
            // ignore parse errors for partial chunks
          }
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err);
  }
}

// ─── API Helpers ─────────────────────────────────────────────────
async function fetchWithAuth(endpoint, body) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${BACKEND}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Server error ${res.status}`);
  }
  return await res.json();
}

async function getWithAuth(endpoint) {
  const headers = await getAuthHeaders();
  // Remove content-type for GET if needed, but it's fine.
  const res = await fetch(`${BACKEND}${endpoint}`, {
    method: 'GET',
    headers: { 'Authorization': headers['Authorization'] }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || `Server error ${res.status}`);
  }
  return await res.json();
}

// ─── Gemini Core Features ─────────────────────────────────────────

export async function generateQuiz(topic, level = 'General') {
  const data = await fetchWithAuth('/api/quiz', { text: topic, level });
  const match = data.result.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Invalid quiz format from AI');
  return JSON.parse(match[0]);
}

export async function summarizeText(text, level = 'General') {
  const data = await fetchWithAuth('/api/summarize', { text, level });
  const raw = data.result;
  const keypoints = raw.match(/##KEYPOINTS##([\s\S]*?)(?:##|$)/)?.[1]?.trim() || '';
  const definitions = raw.match(/##DEFINITIONS##([\s\S]*?)(?:##|$)/)?.[1]?.trim() || '';
  const tldr = raw.match(/##TLDR##([\s\S]*?)(?:##|$)/)?.[1]?.trim() || '';
  return { keypoints, definitions, tldr, raw };
}

export async function generateFlashcards(topic, level = 'General') {
  const data = await fetchWithAuth('/api/flashcards', { text: topic, level });
  const match = data.result.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Invalid flashcard format from AI');
  return JSON.parse(match[0]);
}

export async function detectSubject(text) {
  try {
    const data = await fetchWithAuth('/api/detect-subject', { text: text.slice(0, 300) });
    return data.result?.trim() || 'General';
  } catch {
    return 'General';
  }
}

export async function generateMindMap(topic, level = 'General') {
  const data = await fetchWithAuth('/api/mindmap', { text: topic, level });
  return data.result || '';
}

export async function summarizeArxiv(query, level = 'General') {
  const data = await fetchWithAuth('/api/arxiv', { text: query, level });
  return data.result || '';
}

export async function generateStory(topic, level = 'General') {
  const data = await fetchWithAuth('/api/storymode', { text: topic, level });
  return data.result || '';
}

export async function generateCodePair(code, question, level = 'General') {
  const data = await fetchWithAuth('/api/code-pair', { text: `Code:\n${code}\n\nQuestion:\n${question}`, level });
  return data.result || '';
}

// ─── User Data (MongoDB backend) ──────────────────────────────────

export async function saveQuizScore(topic, score, total, level = 'General') {
  try {
    await fetchWithAuth('/api/user/quiz-score', {
      topic,
      score,
      total,
      pct: Math.round((score / total) * 100),
      education_level: level
    });
  } catch(e) {
    console.error('Failed to save score', e);
  }
}

export async function getQuizScores() {
  try {
    return await getWithAuth('/api/user/scores');
  } catch(e) {
    console.error('Failed to load scores', e);
    return [];
  }
}

export async function getRecommendations() {
  try {
    return await getWithAuth('/api/user/recommendations');
  } catch(e) {
    console.error('Failed to load recommendations', e);
    return null;
  }
}

export async function logActivity(action, metadata = {}) {
  try {
    await fetchWithAuth('/api/user/activity', { action, metadata });
  } catch(e) {
    console.error('Failed to log activity', e);
  }
}

// ─── Clipboard ────────────────────────────────────────────────────
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}
