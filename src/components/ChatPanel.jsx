import { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat, detectSubject, copyToClipboard } from '../utils/api';
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
        background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(123,97,255,0.15))',
        border: '1px solid rgba(0,229,255,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
      }}>
        🧠
      </div>
      <div className="glass" style={{ padding: '12px 16px', display: 'flex', gap: '5px', alignItems: 'center', borderRadius: '18px 18px 18px 4px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginRight: '4px' }}>thinking</span>
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
          : 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(123,97,255,0.12))',
        border: isUser ? 'none' : '1px solid rgba(0,229,255,0.2)',
        boxShadow: isUser ? '0 0 12px rgba(123,97,255,0.4)' : 'none',
      }}>
        {isUser ? '👤' : '🧠'}
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
                fontSize: '0.7rem', cursor: 'none', display: 'flex', alignItems: 'center', gap: '3px',
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
  const [messages, setMessages] = useState([{
    id: 1,
    role: 'assistant',
    content: "Hey! 👋 I'm your **NeuroBuddy AI**. Ask me anything — I'll explain it clearly with analogies, examples, and real insight.\n\nWhat do you want to understand today?",
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
        setMessages(prev => prev.filter(m => m.id !== placeholderId));
        addToast(
          err.message?.includes('429') ? 'Rate limit — wait a moment and try again.' : `Error: ${err.message}`,
          'error'
        );
        setLoading(false);
      }
    );

    // Detect subject (non-blocking)
    detectSubject(input.trim()).then(s => s && onSubjectDetected(s));
  }, [input, messages, loading, addToast, onSubjectDetected, educationLevel]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
      <div style={{
        padding: '16px 24px 20px',
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
