import streamlit as st
import requests
import json

BACKEND_URL = "http://127.0.0.1:8000"
st.set_page_config(page_title="StudyBuddy AI", page_icon="🧠", layout="wide")

# Sidebar
st.sidebar.title("🧠 StudyBuddy AI")
st.sidebar.markdown("Your AI-powered learning assistant.")
st.sidebar.divider()

selected = st.sidebar.radio(
    "Navigation",
    ["Dashboard", "Chat Tutor", "Quiz Generator", "Study Plan"]
)

# Main Content
if selected == "Dashboard":
    st.title("Your Dashboard")
    st.markdown("Track your learning progress and view insights.")
    
    col1, col2, col3 = st.columns(3)
    col1.metric("Total Quizzes", "12", "2 this week")
    col2.metric("Average Score", "86%", "4%")
    col3.metric("Study Streak", "4 Days", "Active")
    
    st.subheader("Current Recommendations")
    st.info("Based on your recent scores, you should focus more on Math (Integration). We recommend taking a practice quiz today.")

elif selected == "Chat Tutor":
    st.title("💬 AI Chat Tutor")
    st.markdown("Ask any question and the AI will help you understand the concept.")
    
    # Streamlit native chat UI
    if "messages" not in st.session_state:
        st.session_state.messages = [{"role": "assistant", "content": "Hi! How can I help you study today?"}]
        
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
            
    if prompt := st.chat_input("Ask a question..."):
        # Display user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        # Fetch from FastAPI Streaming backend
        with st.chat_message("assistant"):
            def stream_chat(messages):
                # Format messages for the backend schema
                payload_msgs = [{"role": m["role"], "content": m["content"]} for m in messages]
                payload = {
                    "messages": payload_msgs,
                    "level": "General",
                    "uid": "anonymous"
                }
                try:
                    with requests.post(f"{BACKEND_URL}/api/chat", json=payload, stream=True) as r:
                        if r.status_code != 200:
                            yield f"Error: Received {r.status_code} from server."
                            return
                        for line in r.iter_lines():
                            if line:
                                decoded = line.decode('utf-8')
                                if decoded.startswith("data: "):
                                    data_str = decoded[6:].strip()
                                    if data_str == "[DONE]":
                                        break
                                    try:
                                        data_json = json.loads(data_str)
                                        if "text" in data_json:
                                            yield data_json["text"]
                                        if "error" in data_json:
                                            yield f"\n**Error:** {data_json['error']}"
                                    except json.JSONDecodeError:
                                        continue
                except Exception as e:
                    yield f"Connection Error: Is the backend running? ({str(e)})"
            
            # st.write_stream writes chunks as they come in and returns the full string
            full_response = st.write_stream(stream_chat(st.session_state.messages))
            st.session_state.messages.append({"role": "assistant", "content": full_response})

elif selected == "Quiz Generator":
    st.title("📝 Generate a Quiz")
    st.markdown("Enter a topic to generate a quick practice quiz.")
    
    topic = st.text_input("Quiz Topic", placeholder="e.g. Photosynthesis")
    
    if st.button("Generate Quiz", type="primary"):
        if topic:
            with st.spinner(f"Generating quiz on '{topic}'..."):
                try:
                    r = requests.post(f"{BACKEND_URL}/api/quiz", json={"text": topic, "level": "General"})
                    r.raise_for_status()
                    quiz_data_str = r.json().get("result", "{}")
                    quiz_data = json.loads(quiz_data_str)
                    
                    st.success("Quiz Generated!")
                    
                    for idx, q in enumerate(quiz_data.get("questions", [])):
                        st.write(f"### Q{idx+1}: {q['question']}")
                        options = q.get("options", [])
                        st.radio("Select an answer:", options, key=f"q_{idx}")
                        
                        with st.expander("Show Answer"):
                            st.write(f"**Answer:** {q.get('answer')}")
                            st.write(f"**Explanation:** {q.get('explanation')}")
                            
                except Exception as e:
                    st.error(f"Failed to generate quiz. Make sure backend is running. ({str(e)})")
        else:
            st.warning("Please enter a topic first.")

elif selected == "Study Plan":
    st.title("📅 Personalized Study Plan")
    st.markdown("Your AI-generated study schedule based on your performance.")
    
    st.write("### This Week's Focus")
    st.write("1. **Monday**: Review basic concepts and flashcards.")
    st.write("2. **Wednesday**: Take a 10-question practice quiz.")
    st.write("3. **Friday**: Deep dive into areas where you scored lowest.")
    
    st.button("Regenerate Plan")
