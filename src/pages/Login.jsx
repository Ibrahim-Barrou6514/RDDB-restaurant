import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ChefHat, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db, googleProvider } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const nav = useNavigate();

  const getFirebaseErrorMessage = (code) => {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email';
      case 'auth/wrong-password': return 'Incorrect password';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/user-disabled': return 'This account has been disabled';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later';
      case 'auth/invalid-credential': return 'Invalid email or password';
      default: return 'Login failed. Please try again';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore to determine redirect
      let role = 'client';
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (userDoc.exists() && userDoc.data().role) {
          role = userDoc.data().role;
        } else if (result.user.email?.toLowerCase().includes('admin')) {
          role = 'admin'; // Fallback
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }

      const isAdmin = role === 'admin';
      const isDeliveryAgent = role === 'delivery_agent';
      
      success(`Welcome back${isAdmin ? ', Admin' : ''}! 🎉`);
      
      if (isAdmin) nav('/admin');
      else if (isDeliveryAgent) nav('/delivery-agent');
      else nav('/');
      
    } catch (err) {
      error(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      let role = 'client';
      try {
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (userDoc.exists() && userDoc.data().role) {
          role = userDoc.data().role;
        }
      } catch (err) {}

      success('Welcome to RDDB! 🎉');
      
      if (role === 'admin') nav('/admin');
      else if (role === 'delivery_agent') nav('/delivery-agent');
      else nav('/');
      
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error('Google sign-in failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-green-dark flex items-center justify-center px-4 pt-20">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4"><ChefHat className="w-8 h-8 text-brand-green-dark"/></div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/50">Sign in to your RDDB account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
            <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="input-dark pl-11" placeholder="you@email.com" disabled={loading}/></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input type={showPw?'text':'password'} required value={password} onChange={e=>setPassword(e.target.value)} className="input-dark pl-11 pr-11" placeholder="••••••••" disabled={loading}/>
              <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin"/>Signing in...</> : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/30">or continue with</span></div>
          </div>

          {/* Google Sign-In */}
          <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/5 transition-all duration-300 text-sm font-medium disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <p className="text-center text-white/40 text-sm">Don't have an account? <Link to="/signup" className="text-brand-gold hover:underline">Sign Up</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
