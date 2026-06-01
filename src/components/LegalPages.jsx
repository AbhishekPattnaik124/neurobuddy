import React from 'react';

export function PrivacyPolicy({ onBack }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Privacy Policy</h1>
        <button className="btn-secondary" onClick={onBack}>&times; Close</button>
      </div>
      <div style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
        <h2>1. Information We Collect</h2>
        <p>When you use NeuroBuddy AI, we collect minimal personal information necessary to provide our services:</p>
        <ul>
          <li><strong>Authentication Data:</strong> Your email address, name, and profile picture (processed securely via Firebase Authentication).</li>
          <li><strong>Usage Data:</strong> We store your quiz scores and general activity logs to help track your learning progress.</li>
          <li><strong>Locally Stored Data:</strong> We use local storage on your device to remember your education level preferences.</li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <p>Your data is used strictly for:</p>
        <ul>
          <li>Providing personalized AI tutoring experiences.</li>
          <li>Tracking your academic progress over time.</li>
          <li>Sending critical account-related emails (like OTPs or progress reports).</li>
        </ul>
        <p><strong>We DO NOT sell, rent, or share your personal data with third-party advertisers.</strong></p>

        <h2>3. Data Storage & Security</h2>
        <p>Your data is securely stored in cloud databases. We use standard encryption and security practices. Our backend uses AI models (Google Gemini) to process text; please do not submit highly sensitive personal information (like SSNs or financial data) into the AI chat or summarizer.</p>

        <h2>4. Your Rights (GDPR / CCPA)</h2>
        <p>You have the right to request access to your data or request complete deletion of your account and associated records at any time. To do so, please contact the developer.</p>

        <h2>5. Cookies & Local Storage</h2>
        <p>We do not use tracking cookies for advertising. We only use local storage for essential application functionality (like keeping you logged in and remembering your settings).</p>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}><em>Last updated: Today</em></p>
      </div>
    </div>
  );
}

export function TermsOfService({ onBack }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>Terms of Service</h1>
        <button className="btn-secondary" onClick={onBack}>&times; Close</button>
      </div>
      <div style={{ lineHeight: '1.6', color: 'var(--text-muted)' }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using NeuroBuddy AI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

        <h2>2. Use of AI Services</h2>
        <p>NeuroBuddy AI utilizes artificial intelligence to generate educational content. While we strive for accuracy, AI-generated content may occasionally be incorrect or misleading. You agree to use the generated content as a learning aid and not as absolute factual truth. We are not liable for academic or professional consequences arising from the use of AI-generated answers.</p>

        <h2>3. Acceptable Use Policy</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Use the platform to generate illegal, hateful, or abusive content.</li>
          <li>Attempt to reverse-engineer, overwhelm, or perform automated denial-of-service (DoS) attacks on our APIs.</li>
          <li>Submit sensitive Personally Identifiable Information (PII) into the AI prompts.</li>
        </ul>
        <p>We reserve the right to ban accounts that violate these terms or abuse API rate limits.</p>

        <h2>4. Limitation of Liability</h2>
        <p>The service is provided "AS IS". We make no warranties regarding the uptime, reliability, or accuracy of the application. In no event shall the developers be liable for any damages arising out of the use or inability to use the service.</p>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem' }}><em>Last updated: Today</em></p>
      </div>
    </div>
  );
}
