import { useState, useRef } from 'react';

export function OtpInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const text = e.target.value;
    if (isNaN(text)) return;
    
    const newOtp = [...otp];
    // take last char in case they type multiple quickly
    newOtp[index] = text.substring(text.length - 1);
    setOtp(newOtp);

    // Auto focus next
    if (text && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, length).split('');
    if (pasteData.some(isNaN)) return;
    
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
    inputRefs.current[Math.min(pasteData.length, length - 1)].focus();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
      {otp.map((value, index) => (
        <input
          key={index}
          type="text"
          ref={(ref) => inputRefs.current[index] = ref}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          className="otp-input"
          style={{
            width: '40px', height: '50px', fontSize: '24px', textAlign: 'center',
            borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-panel)',
            color: 'var(--text-main)', outline: 'none', transition: 'all 0.2s'
          }}
          maxLength={1}
        />
      ))}
    </div>
  );
}
