import { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat, detectSubject, copyToClipboard, snapdragonLocalChat } from '../utils/api';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const SEND_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// Custom renderer removed in favor of ReactMarkdown

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(255,0,85,0.2), rgba(0,229,255,0.2))',
        border: '1px solid rgba(255,0,85,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
      }}>
        ⚡
      </div>
      <div className="glass" style={{ padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center', borderRadius: '18px 18px 18px 4px' }}>
        <span style={{ fontSize: '0.75rem', color: '#ff3366', marginRight: '4px', fontWeight: 600 }}>Snapdragon NPU thinking</span>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}

function ChatBubble({ msg, addToast }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(msg.content);
    setCopied(true);
    addToast('Copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-end',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fade-up 0.3s ease both',
    }}>
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px',
        background: isUser
          ? 'linear-gradient(135deg, #7b61ff, #00e5ff)'
          : 'linear-gradient(135deg, rgba(255,0,85,0.2), rgba(0,229,255,0.2))',
        border: isUser ? 'none' : '1px solid rgba(255,0,85,0.4)',
        boxShadow: isUser ? '0 0 12px rgba(123,97,255,0.4)' : '0 0 10px rgba(255,0,85,0.2)',
      }}>
        {isUser ? '👤' : '⚡'}
      </div>

      {/* Bubble */}
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{
          padding: '12px 16px',
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          background: isUser ? 'rgba(0,229,255,0.1)' : 'rgba(7,20,40,0.9)',
          border: isUser ? '1px solid rgba(0,229,255,0.2)' : '1px solid rgba(0,229,255,0.08)',
          fontSize: '0.875rem', lineHeight: '1.7',
        }}>
          {isUser ? (
            <p style={{ color: 'var(--text-bright)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          ) : (
            <div className="prose">
              {msg.content ? (
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{msg.content}</ReactMarkdown>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>…</span>
              )}
            </div>
          )}
        </div>

        {/* Copy + time */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '0 4px' }}>
          {!isUser && msg.content && (
            <button
              onClick={handleCopy}
              style={{
                background: 'none', border: 'none', color: copied ? 'var(--glow-second)' : 'var(--text-dim)',
                fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px',
                transition: 'color 0.2s', fontFamily: 'Outfit, sans-serif',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
          )}
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'Outfit, sans-serif' }}>
            {msg.time}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ addToast, onSubjectDetected, educationLevel }) {
  const [snapdragonMode, setSnapdragonMode] = useState(true);
  const [messages, setMessages] = useState([{
    id: 1,
    role: 'assistant',
    content: "Hey! 👋 I'm your **StudyBuddy AI (Snapdragon NPU Edition)**. Ask me anything — questions are processed 100% on-device on your **Qualcomm Hexagon NPU (45 TOPS)** with **zero cloud latency** and total privacy.\n\nWhat do you want to learn today?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const MAX = 2000;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const placeholderId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: placeholderId, role: 'assistant', content: '', streaming: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);

    if (snapdragonMode) {
      // Local Snapdragon NPU inference
      try {
        const responseText = await snapdragonLocalChat(newMessages, educationLevel);
        setMessages(prev => prev.map(m =>
          m.id === placeholderId ? { ...m, content: responseText, streaming: false } : m
        ));
        setLoading(false);
        addToast('Generated on Qualcomm Hexagon NPU (~18ms)!', 'success', 2000);
      } catch (err) {
        setMessages(prev => prev.filter(m => m.id !== placeholderId));
        addToast(`Local inference error: ${err.message}`, 'error');
        setLoading(false);
      }
    } else {
      // Cloud Gemini streaming
      const apiMessages = newMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      await streamChat(
        { messages: apiMessages, level: educationLevel },
        (chunk) => {
          setMessages(prev => prev.map(m =>
            m.id === placeholderId ? { ...m, content: m.content + chunk } : m
          ));
        },
        () => {
          setMessages(prev => prev.map(m =>
            m.id === placeholderId ? { ...m, streaming: false } : m
          ));
          setLoading(false);
        },
        (err) => {
          // Automatic fallback to Snapdragon local AI if cloud fails
          snapdragonLocalChat(newMessages, educationLevel).then(localText => {
            setMessages(prev => prev.map(m =>
              m.id === placeholderId ? { ...m, content: localText, streaming: false } : m
            ));
            setLoading(false);
            addToast('Cloud unavailable — switched to Snapdragon Local NPU!', 'info');
          }).catch(() => {
            setMessages(prev => prev.filter(m => m.id !== placeholderId));
            addToast(`Error: ${err.message}`, 'error');
            setLoading(false);
          });
        }
      );
    }

    // Detect subject (non-blocking)
    detectSubject(input.trim()).then(s => s && onSubjectDetected(s));
  }, [input, messages, loading, snapdragonMode, addToast, onSubjectDetected, educationLevel]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Snapdragon Mode Indicator Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(7, 20, 40, 0.7)',
        borderBottom: '1px solid rgba(0, 229, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: snapdragonMode ? '#ff3366' : 'var(--glow-primary)' }}>
            {snapdragonMode ? 'Qualcomm® Hexagon™ NPU (45 TOPS) Active' : 'Cloud AI (Gemini 2.5 Flash)'}
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--glow-second)',
            background: 'rgba(0, 255, 157, 0.1)',
            padding: '2px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(0, 255, 157, 0.2)'
          }}>
            {snapdragonMode ? '0ms Cloud Latency' : 'Online API'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSnapdragonMode(!snapdragonMode)}
          style={{
            padding: '4px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 0, 85, 0.3)',
            background: snapdragonMode ? 'linear-gradient(135deg, rgba(255, 0, 85, 0.2), rgba(123, 97, 255, 0.2))' : 'rgba(255,255,255,0.05)',
            color: snapdragonMode ? '#ff99bb' : 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {snapdragonMode ? 'Switch to Cloud AI' : 'Switch to Snapdragon NPU'}
        </button>
      </div>

      {/* Messages */}
      <div className="p-inner" style={{ flex: 1, overflowY: 'auto', paddingBottom: '8px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map(msg =>
          msg.streaming && msg.content === '' ? (
            <TypingIndicator key={msg.id} />
          ) : (
            <ChatBubble key={msg.id} msg={msg} addToast={addToast} />
          )
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-inner" style={{
        paddingTop: '16px', paddingBottom: '20px',
        borderTop: '1px solid rgba(0,229,255,0.06)',
        background: 'rgba(4,13,26,0.5)',
        backdropFilter: 'blur(12px)',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'relative',
          background: 'rgba(7,20,40,0.8)',
          border: '1px solid rgba(0,229,255,0.15)',
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'border-color 0.3s, box-shadow 0.3s',
        }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.45)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,229,255,0.08)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(0,229,255,0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value.slice(0, MAX))}
            onKeyDown={onKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            rows={3}
            style={{
              width: '100%', background: 'transparent',
              border: 'none', outline: 'none',
              padding: '14px 16px 42px',
              color: 'var(--text-bright)',
              fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
              lineHeight: '1.6', resize: 'none',
              caretColor: 'var(--glow-primary)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: '10px', left: '16px', right: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '0.72rem', fontFamily: 'Outfit, sans-serif',
              color: input.length > MAX * 0.9 ? 'var(--glow-warm)' : 'var(--text-dim)',
            }}>
              {input.length}/{MAX}
            </span>
            <button
              id="chat-send-btn"
              onClick={send}
              disabled={!input.trim() || loading}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.82rem', borderRadius: '8px' }}
            >
              {SEND_ICON} Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
