import streamlit as st
import requests
import json
import re
import os

# ── Config ────────────────────────────────────────────────────────────────────
BACKEND_URL = os.getenv("BACKEND_URL", "https://neurobuddy-backend.onrender.com")

st.set_page_config(
    page_title="NeuroBuddy AI",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ── CSS ───────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');

html, body, [class*="css"], [class*="st-"] {
    font-family: 'Outfit', sans-serif;
}
/* Prevent icons from turning into text */
.stIcon, .material-symbols-rounded, [data-testid="stIconMaterial"], [class*="Icon"] {
    font-family: 'Material Symbols Rounded', 'Material Icons' !important;
}
h1, h2, h3 { font-family: 'Syne', sans-serif !important; }

/* Hide Streamlit default UI chrome */
#MainMenu, footer { visibility: hidden; }
header { background-color: transparent !important; }
.stDeployButton { display: none; }

/* Sidebar */
[data-testid="stSidebar"] {
    background: #071428 !important;
    border-right: 1px solid rgba(0,229,255,0.12) !important;
}
[data-testid="stSidebar"] * { color: #e8f4ff !important; }

/* Main background */
.stApp { background: #040d1a !important; color: #e8f4ff !important; }

/* Buttons */
.stButton > button {
    background: linear-gradient(135deg, #00e5ff, #00ff9d) !important;
    color: #020810 !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    font-family: 'Outfit', sans-serif !important;
    transition: all 0.2s !important;
}
.stButton > button:hover { opacity: 0.9; transform: translateY(-1px); }

/* Text inputs */
.stTextInput > div > div > input,
.stTextArea > div > div > textarea,
.stSelectbox > div > div > select {
    background: rgba(7,20,40,0.9) !important;
    border: 1px solid rgba(0,229,255,0.2) !important;
    color: #e8f4ff !important;
    border-radius: 10px !important;
    font-family: 'Outfit', sans-serif !important;
}

/* Info / success / error boxes */
.stAlert { border-radius: 10px !important; }

/* Metric cards */
[data-testid="metric-container"] {
    background: rgba(7,20,40,0.8);
    border: 1px solid rgba(0,229,255,0.1);
    border-radius: 12px;
    padding: 12px;
}

/* Expander */
.streamlit-expanderHeader {
    background: rgba(7,20,40,0.6) !important;
    border: 1px solid rgba(0,229,255,0.1) !important;
    border-radius: 10px !important;
    color: #e8f4ff !important;
}

/* Divider */
hr { border-color: rgba(0,229,255,0.1) !important; }

/* Radio buttons */
.stRadio > label { color: #e8f4ff !important; }
</style>
""", unsafe_allow_html=True)

# ── Helpers ───────────────────────────────────────────────────────────────────
def post(endpoint: str, body: dict, timeout: int = 60):
    """POST to backend, return parsed JSON or raise."""
    r = requests.post(f"{BACKEND_URL}{endpoint}", json=body, timeout=timeout)
    r.raise_for_status()
    return r.json()

def extract_json_array(text: str):
    """Extract the first JSON array from a possibly-dirty string."""
    match = re.search(r'\[[\s\S]*\]', text)
    if not match:
        raise ValueError("No JSON array found in response")
    return json.loads(match.group())

def stream_chat(messages: list, level: str):
    """Generator: yields text chunks from the SSE /api/chat endpoint."""
    payload = {
        "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
        "level": level,
        "uid": "anonymous"
    }
    try:
        with requests.post(f"{BACKEND_URL}/api/chat", json=payload, stream=True, timeout=90) as r:
            if r.status_code != 200:
                yield f"❌ Server error {r.status_code}"
                return
            for line in r.iter_lines():
                if line:
                    decoded = line.decode("utf-8")
                    if not decoded.startswith("data: "):
                        continue
                    payload_str = decoded[6:].strip()
                    if payload_str == "[DONE]":
                        break
                    try:
                        data = json.loads(payload_str)
                        if "text" in data:
                            yield data["text"]
                        if "error" in data:
                            yield f"\n\n❌ **Error:** {data['error']}"
                    except json.JSONDecodeError:
                        continue
    except Exception as e:
        yield f"❌ Connection error: {e}"

# ── Sidebar Navigation ─────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## 🧠 NeuroBuddy AI")
    st.markdown("*Your AI-powered learning companion*")
    st.divider()

    page = st.radio(
        "Navigate",
        ["🏠 Dashboard", "💬 Chat Tutor", "🎯 Quiz", "📝 Summarizer",
         "🃏 Flashcards", "🧠 Mind Map", "🔬 ArXiv", "📖 Story Mode",
         "💻 Code Pair", "📈 Progress"],
        label_visibility="collapsed"
    )
    st.divider()

    # Education Level selector
    edu_level = st.selectbox(
        "🎓 Education Level",
        ["General", "Grade 1-10", "High School", "BTech", "MTech", "PhD"],
        key="edu_level"
    )

    # Backend status
    try:
        h = requests.get(f"{BACKEND_URL}/api/health", timeout=5).json()
        if h.get("status") == "ok" and h.get("key_set"):
            st.success("🟢 Backend Online")
        else:
            st.warning("🟡 Backend issue")
    except Exception:
        st.error("🔴 Backend Offline")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Dashboard
# ══════════════════════════════════════════════════════════════════════════════
if page == "🏠 Dashboard":
    st.title("🏠 Dashboard")
    st.markdown(f"Welcome! You're on **{edu_level}** level. Pick a tool from the sidebar.")
    st.divider()

    tools = [
        ("💬", "Chat Tutor", "Ask anything — get real-time AI explanations"),
        ("🎯", "Quiz", "Generate 5 MCQ questions on any topic"),
        ("📝", "Summarizer", "Paste text → Key Points + Definitions + TL;DR"),
        ("🃏", "Flashcards", "8 flip-cards to test deep understanding"),
        ("🧠", "Mind Map", "Visual Mermaid mindmap of any concept"),
        ("🔬", "ArXiv", "Fetch & summarize real research papers"),
        ("📖", "Story Mode", "Learn through fun, educational stories"),
        ("💻", "Code Pair", "Paste code + ask an expert senior engineer"),
        ("📈", "Progress", "View your quiz history and stats"),
    ]

    cols = st.columns(3)
    for i, (icon, name, desc) in enumerate(tools):
        with cols[i % 3]:
            st.info(f"**{icon} {name}**\n\n{desc}")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Chat Tutor
# ══════════════════════════════════════════════════════════════════════════════
elif page == "💬 Chat Tutor":
    st.title("💬 AI Chat Tutor")
    st.caption("Real-time streaming chat — explains any concept clearly.")

    if "messages" not in st.session_state:
        st.session_state.messages = [{
            "role": "assistant",
            "content": "Hey! 👋 I'm your **NeuroBuddy AI**. Ask me anything and I'll explain it clearly!\n\nWhat do you want to understand today?"
        }]

    # Render history
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"], avatar="🧠" if msg["role"] == "assistant" else "👤"):
            st.markdown(msg["content"])

    if prompt := st.chat_input("Ask anything… (e.g. Explain quantum entanglement)"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        with st.chat_message("assistant", avatar="🧠"):
            full = st.write_stream(stream_chat(st.session_state.messages, edu_level))
            st.session_state.messages.append({"role": "assistant", "content": full or ""})

    if st.button("🗑️ Clear Chat"):
        st.session_state.messages = [{
            "role": "assistant",
            "content": "Chat cleared! 👋 Ask me anything."
        }]
        st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Quiz
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🎯 Quiz":
    st.title("🎯 Quiz Generator")
    st.caption("Generates 5 progressive multiple-choice questions on any topic.")

    suggestions = ["Photosynthesis", "Bubble Sort", "World War II", "Newton's Laws", "Python Lists"]
    cols = st.columns(len(suggestions))
    for i, s in enumerate(suggestions):
        if cols[i].button(s, key=f"sug_{i}"):
            st.session_state["quiz_topic"] = s

    topic = st.text_input("Topic", value=st.session_state.get("quiz_topic", ""), placeholder="e.g. Photosynthesis")

    if st.button("⚡ Generate Quiz", type="primary", disabled=not topic.strip()):
        with st.spinner("Crafting your quiz…"):
            try:
                data = post("/api/quiz", {"text": topic, "level": edu_level})
                raw = data.get("result", "")
                quiz = extract_json_array(raw)
                st.session_state["quiz_data"] = quiz
                st.session_state["quiz_answers"] = {}
                st.session_state["quiz_submitted"] = False
                st.session_state["quiz_topic_used"] = topic
            except Exception as e:
                st.error(f"❌ Failed: {e}")

    if st.session_state.get("quiz_data") and not st.session_state.get("quiz_submitted"):
        quiz = st.session_state["quiz_data"]
        st.divider()
        st.markdown(f"### Quiz: *{st.session_state.get('quiz_topic_used', '')}*")

        with st.form("quiz_form"):
            answers = {}
            for i, q in enumerate(quiz):
                st.markdown(f"**Q{i+1}. {q.get('q', q.get('question', ''))}**")
                opts = q.get("opts", q.get("options", []))
                choice = st.radio(
                    f"Q{i+1}", opts,
                    key=f"qopt_{i}",
                    label_visibility="collapsed",
                    index=None
                )
                answers[i] = choice
                st.divider()

            submitted = st.form_submit_button("✅ Submit Answers", type="primary")
            if submitted:
                st.session_state["quiz_answers"] = answers
                st.session_state["quiz_submitted"] = True
                st.rerun()

    if st.session_state.get("quiz_submitted"):
        quiz = st.session_state["quiz_data"]
        answers = st.session_state["quiz_answers"]
        score = 0

        st.divider()
        st.markdown("## 📊 Results")

        for i, q in enumerate(quiz):
            opts = q.get("opts", q.get("options", []))
            correct_idx = q.get("ans", q.get("answer_index", 0))
            correct_opt = opts[correct_idx] if isinstance(correct_idx, int) and correct_idx < len(opts) else str(correct_idx)
            user_ans = answers.get(i)
            is_correct = user_ans == correct_opt

            if is_correct:
                score += 1
                st.success(f"✅ **Q{i+1}**: {q.get('q', q.get('question', ''))} — *{correct_opt}*")
            else:
                st.error(f"❌ **Q{i+1}**: {q.get('q', q.get('question', ''))}\n\nYour answer: *{user_ans}* | Correct: *{correct_opt}*")

        pct = round((score / len(quiz)) * 100)
        emoji = "🔥" if pct == 100 else "⚡" if pct >= 80 else "💪" if pct >= 60 else "🎯"
        st.markdown(f"## {emoji} Score: **{score}/{len(quiz)}** ({pct}%)")

        if st.button("🔄 Retake / New Quiz"):
            for k in ["quiz_data", "quiz_answers", "quiz_submitted", "quiz_topic_used"]:
                st.session_state.pop(k, None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Summarizer
# ══════════════════════════════════════════════════════════════════════════════
elif page == "📝 Summarizer":
    st.title("📝 Text Summarizer")
    st.caption("Paste text → get Key Points, Definitions, and TL;DR.")

    EXAMPLE = """Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored as glucose. The overall equation: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. There are two main stages: the light-dependent reactions (in thylakoid membranes, producing ATP and NADPH) and the Calvin cycle (in the stroma, producing glucose). Photosynthesis is critical for life — it produces oxygen and forms the base of most food chains."""

    if st.button("📋 Load Example"):
        st.session_state["sum_input"] = EXAMPLE

    text = st.text_area(
        "Paste your notes or any text here",
        value=st.session_state.get("sum_input", ""),
        height=200,
        placeholder="Paste lecture notes, textbook paragraphs, or any educational text…",
        key="sum_input_box"
    )

    char_count = len(text)
    word_count = len(text.split()) if text.strip() else 0
    st.caption(f"{word_count} words · {char_count}/6000 chars")

    if st.button("✨ Summarize", type="primary", disabled=not text.strip() or len(text) < 50):
        with st.spinner("Analyzing your text…"):
            try:
                data = post("/api/summarize", {"text": text[:6000], "level": edu_level})
                raw = data.get("result", "")

                def extract_section(header):
                    m = re.search(rf'##{header}##([\s\S]*?)(?:##|$)', raw)
                    return m.group(1).strip() if m else ""

                keypoints   = extract_section("KEYPOINTS")
                definitions = extract_section("DEFINITIONS")
                tldr        = extract_section("TLDR")

                col1, col2 = st.columns(2)
                with col1:
                    st.markdown("### 🔑 Key Points")
                    for line in keypoints.split("\n"):
                        line = line.strip().lstrip("-•").strip()
                        if line:
                            st.markdown(f"▸ {line}")

                    st.divider()
                    st.markdown("### 📖 Definitions")
                    for line in definitions.split("\n"):
                        line = line.strip()
                        if line and ":" in line:
                            term, _, rest = line.partition(":")
                            st.markdown(f"**{term.strip()}**: {rest.strip()}")
                        elif line:
                            st.markdown(line)

                with col2:
                    st.markdown("### ⚡ TL;DR")
                    st.info(tldr or raw[:500])

            except Exception as e:
                st.error(f"❌ Error: {e}")

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Flashcards
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🃏 Flashcards":
    st.title("🃏 Flashcard Maker")
    st.caption("Generates 8 flashcards to test deep understanding, not just memorization.")

    topic = st.text_input("Topic", placeholder="e.g. React Hooks, Newton's Laws, DNA Replication")

    if st.button("🃏 Generate Flashcards", type="primary", disabled=not topic.strip()):
        with st.spinner("Generating flashcards…"):
            try:
                data = post("/api/flashcards", {"text": topic, "level": edu_level})
                cards = extract_json_array(data.get("result", ""))
                st.session_state["flashcards"] = cards
                st.session_state["fc_idx"] = 0
                st.session_state["fc_flipped"] = False
                st.session_state["fc_mastered"] = set()
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if st.session_state.get("flashcards"):
        cards = st.session_state["flashcards"]
        idx = st.session_state.get("fc_idx", 0)
        flipped = st.session_state.get("fc_flipped", False)
        mastered = st.session_state.get("fc_mastered", set())
        card = cards[idx]

        st.divider()
        st.markdown(f"**Card {idx+1} of {len(cards)}** · ✅ {len(mastered)} mastered")
        st.progress((idx + 1) / len(cards))

        # Card display
        if not flipped:
            st.info(f"**❓ Question:**\n\n{card.get('front', card.get('question', ''))}")
        else:
            st.success(f"**💡 Answer:**\n\n{card.get('back', card.get('answer', ''))}")

        col1, col2, col3, col4 = st.columns(4)
        with col1:
            if st.button("◀ Prev", disabled=idx == 0):
                st.session_state["fc_idx"] = idx - 1
                st.session_state["fc_flipped"] = False
                st.rerun()
        with col2:
            label = "🔓 Reveal" if not flipped else "🔒 Hide"
            if st.button(label):
                st.session_state["fc_flipped"] = not flipped
                st.rerun()
        with col3:
            star = "⭐ Mastered" if idx in mastered else "☆ Mark Mastered"
            if st.button(star):
                if idx in mastered:
                    mastered.discard(idx)
                else:
                    mastered.add(idx)
                st.session_state["fc_mastered"] = mastered
                st.rerun()
        with col4:
            if st.button("Next ▶", disabled=idx == len(cards) - 1):
                st.session_state["fc_idx"] = idx + 1
                st.session_state["fc_flipped"] = False
                st.rerun()

        if len(mastered) == len(cards):
            st.balloons()
            st.success("🎉 You've mastered all cards!")

        if st.button("← New Topic"):
            st.session_state.pop("flashcards", None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Mind Map
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🧠 Mind Map":
    st.title("🧠 Mind Map Generator")
    st.caption("Generates a visual Mermaid.js mindmap for any topic.")

    topic = st.text_input("Topic", placeholder="e.g. Machine Learning, Photosynthesis")

    if st.button("🧠 Generate Mind Map", type="primary", disabled=not topic.strip()):
        with st.spinner("Building your mind map…"):
            try:
                data = post("/api/mindmap", {"text": topic, "level": edu_level})
                code = data.get("result", "")
                st.session_state["mindmap_code"] = code
                st.session_state["mindmap_topic"] = topic
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if st.session_state.get("mindmap_code"):
        st.divider()
        st.markdown(f"### {st.session_state.get('mindmap_topic', '')}")

        code = st.session_state["mindmap_code"]
        # Render Mermaid via HTML
        st.components.v1.html(f"""
        <div style="background:#071428;border:1px solid rgba(0,229,255,0.12);border-radius:12px;padding:24px;min-height:400px;">
          <div class="mermaid" style="text-align:center;">{code}</div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <script>mermaid.initialize({{startOnLoad:true, theme:'dark'}});</script>
        """, height=500, scrolling=True)

        with st.expander("📋 View Raw Mermaid Code"):
            st.code(code, language="text")

        if st.button("← New Map"):
            st.session_state.pop("mindmap_code", None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: ArXiv
# ══════════════════════════════════════════════════════════════════════════════
elif page == "🔬 ArXiv":
    st.title("🔬 ArXiv Paper Summarizer")
    st.caption("Search real scientific papers and get instant PhD-level summaries.")

    suggestions = ["attention mechanism", "quantum computing", "CRISPR gene editing", "large language models"]
    cols = st.columns(len(suggestions))
    for i, s in enumerate(suggestions):
        if cols[i].button(s, key=f"arxiv_sug_{i}"):
            st.session_state["arxiv_query"] = s

    query = st.text_input("Search topic / keywords", value=st.session_state.get("arxiv_query", ""), placeholder="e.g. attention is all you need")

    if st.button("🔬 Fetch & Summarize", type="primary", disabled=not query.strip()):
        with st.spinner("Searching ArXiv databases…"):
            try:
                data = post("/api/arxiv", {"text": query, "level": edu_level}, timeout=30)
                result = data.get("result", "")
                st.session_state["arxiv_result"] = result
            except requests.exceptions.Timeout:
                st.error("⏱️ ArXiv took too long to respond. Try a different query.")
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if st.session_state.get("arxiv_result"):
        st.divider()
        st.markdown(st.session_state["arxiv_result"])
        if st.button("← New Search"):
            st.session_state.pop("arxiv_result", None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Story Mode
# ══════════════════════════════════════════════════════════════════════════════
elif page == "📖 Story Mode":
    st.title("📖 StoryMode AI")
    st.caption("Learn complex topics through fun, engaging educational stories.")

    suggestions = ["The Solar System", "How Plants Grow", "The Human Heart", "Dinosaurs"]
    cols = st.columns(len(suggestions))
    for i, s in enumerate(suggestions):
        if cols[i].button(s, key=f"story_sug_{i}"):
            st.session_state["story_topic"] = s

    topic = st.text_input("Topic for the story", value=st.session_state.get("story_topic", ""), placeholder="What should the story be about?")

    if st.button("📖 Tell Me a Story!", type="primary", disabled=not topic.strip()):
        with st.spinner("Once upon a time…"):
            try:
                data = post("/api/storymode", {"text": topic, "level": edu_level})
                story = data.get("result", "")
                st.session_state["story_result"] = story
                st.session_state["story_topic_used"] = topic
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if st.session_state.get("story_result"):
        st.divider()
        st.markdown(f"### The Story of: *{st.session_state.get('story_topic_used', '')}*")
        st.markdown(st.session_state["story_result"])
        if st.button("← New Story"):
            st.session_state.pop("story_result", None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Code Pair
# ══════════════════════════════════════════════════════════════════════════════
elif page == "💻 Code Pair":
    st.title("💻 Code Pair Programmer")
    st.caption("Paste code + ask a question. Get expert Senior Engineer feedback.")

    col1, col2 = st.columns([3, 2])
    with col1:
        code = st.text_area("Your Code", height=250, placeholder="Paste your code here…", key="cp_code")
    with col2:
        question = st.text_area("Your Question", height=120, placeholder="E.g. Why is this returning undefined? How can I optimize this?", key="cp_question")
        st.caption("💡 Tip: Ask specific questions for better answers")

    if st.button("💻 Ask Pair Programmer", type="primary", disabled=not code.strip() or not question.strip()):
        with st.spinner("Expert senior engineer reviewing your code…"):
            try:
                prompt = f"Code:\n{code}\n\nQuestion:\n{question}"
                data = post("/api/code-pair", {"text": prompt, "level": edu_level})
                response = data.get("result", "")
                st.session_state["codepair_result"] = response
            except Exception as e:
                st.error(f"❌ Error: {e}")

    if st.session_state.get("codepair_result"):
        st.divider()
        st.markdown("### 🤖 AI Code Review")
        st.markdown(st.session_state["codepair_result"])
        if st.button("🔄 New Review"):
            st.session_state.pop("codepair_result", None)
            st.rerun()

# ══════════════════════════════════════════════════════════════════════════════
# PAGE: Progress
# ══════════════════════════════════════════════════════════════════════════════
elif page == "📈 Progress":
    st.title("📈 My Progress")
    st.caption("Your quiz history and performance stats. Login required.")

    st.info("🔐 Progress tracking requires authentication via the main web app. Quiz scores are saved automatically when you take quizzes while logged in.")

    st.markdown("### How scores are saved:")
    st.markdown("""
    - Scores are saved automatically after every quiz in the **main web app** ([neurobuddy-hegt.onrender.com](https://neurobuddy-hegt.onrender.com))
    - Each score records: topic, score, total, percentage, and timestamp
    - Your streak is calculated based on consecutive active days
    - The radar chart shows your performance across different subjects
    """)

    st.divider()
    st.markdown("### 🚀 Open the Full Web App for Complete Progress Dashboard")
    st.markdown("[👉 Open NeuroBuddy AI Web App](https://neurobuddy-hegt.onrender.com)")
