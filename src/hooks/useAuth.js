import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

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
      await fetch('http://localhost:8000/api/auth/send-otp', {
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
      const res = await fetch('http://localhost:8000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      if (!res.ok) {
          throw new Error('Invalid OTP');
      }
      return await res.json();
  }

  return { loginWithGoogle, loginWithEmail, registerWithEmail, forgotPassword, verifyOtp };
}
