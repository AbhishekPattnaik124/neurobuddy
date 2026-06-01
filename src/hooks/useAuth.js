import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://neurobuddy-backend.onrender.com';

export function useAuth() {
  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (name, email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Call backend to send OTP
    try {
      await fetch(`${BACKEND}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
    } catch(e) {
      console.error('OTP trigger failed', e);
    }
    return cred;
  };

  const forgotPassword = async (email) => {
    return await sendPasswordResetEmail(auth, email);
  };

  const verifyOtp = async (email, code) => {
    const res = await fetch(`${BACKEND}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.detail || 'Invalid OTP. Please try again.');
    }
    return await res.json();
  };

  return { loginWithGoogle, loginWithEmail, registerWithEmail, forgotPassword, verifyOtp };
}
