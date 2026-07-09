import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://neurobuddy-backend.onrender.com';

export function useAuth() {
  const loginWithGoogle = async () => {
    return await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const registerWithEmail = async (name, email, password) => {
    // Store password temporarily so we can sign back in after OTP
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // Sign out immediately — the user must verify OTP before accessing the app
    await signOut(auth);
    // Store credentials temporarily for post-OTP sign-in
    sessionStorage.setItem('nb_pending_email', email);
    sessionStorage.setItem('nb_pending_pass', password);
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
    // OTP verified — sign the user back in
    const pendingEmail = sessionStorage.getItem('nb_pending_email');
    const pendingPass = sessionStorage.getItem('nb_pending_pass');
    if (pendingEmail && pendingPass) {
      await signInWithEmailAndPassword(auth, pendingEmail, pendingPass);
      sessionStorage.removeItem('nb_pending_email');
      sessionStorage.removeItem('nb_pending_pass');
    }
    return await res.json().catch(() => ({ status: 'verified' }));
  };

  return { loginWithGoogle, loginWithEmail, registerWithEmail, forgotPassword, verifyOtp };
}
