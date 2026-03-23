import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ChefHat, Phone as PhoneIcon, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNotification } from '../context/NotificationContext';

export default function Signup() {
  const [form, setForm] = useState({name:'',email:'',phone:'',password:'',confirm:'',role:'client'});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const nav = useNavigate();
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const getFirebaseErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists';
      case 'auth/invalid-email': return 'Invalid email address';
      case 'auth/weak-password': return 'Password must be at least 6 characters';
      case 'auth/operation-not-allowed': return 'Email/password signup is not enabled';
      default: return 'Signup failed. Please try again';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { error('Passwords do not match'); return; }
    if (form.password.length < 6) { error('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Update display name
      await updateProfile(result.user, { displayName: form.name });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        createdAt: new Date().toISOString(),
      });

      success('Account created! Welcome to RDDB 🎉');
      
      if (form.role === 'admin') nav('/admin');
      else if (form.role === 'delivery_agent') nav('/delivery-agent');
      else nav('/');
      
    } catch (err) {
      error(getFirebaseErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Save to Firestore if new user. Preserve role if existing.
      await setDoc(doc(db, 'users', result.user.uid), {
        name: result.user.displayName || '',
        email: result.user.email,
        // Only set default values if doc doesn't exist (merge: true helps with this, 
        // but to be perfectly safe with roles we would need getDoc first. 
        // For simplicity in signup popup, assuming merge leaves existing role intact)
        phone: '',
        role: form.role,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      success('Welcome to RDDB! 🎉');
      
      if (form.role === 'admin') nav('/admin');
      else if (form.role === 'delivery_agent') nav('/delivery-agent');
      else nav('/');
      
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        error('Google sign-up failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-green-dark flex items-center justify-center px-4 pt-20 pb-12">
      <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center mx-auto mb-4"><ChefHat className="w-8 h-8 text-brand-green-dark"/></div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/50">Join RDDB for exclusive benefits</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-4">
          <div><label className="block text-sm font-medium text-white/70 mb-1">Full Name</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input required value={form.name} onChange={e=>set('name',e.target.value)} className="input-dark pl-11" placeholder="Your name" disabled={loading}/></div></div>
          <div><label className="block text-sm font-medium text-white/70 mb-1">Email</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} className="input-dark pl-11" placeholder="email@example.com" disabled={loading}/></div></div>
          <div><label className="block text-sm font-medium text-white/70 mb-1">Phone</label><div className="relative"><PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input required value={form.phone} onChange={e=>set('phone',e.target.value)} className="input-dark pl-11" placeholder="+237 6XX XXX XXX" disabled={loading}/></div></div>
          <div><label className="block text-sm font-medium text-white/70 mb-1">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input type={showPw?'text':'password'} required minLength={6} value={form.password} onChange={e=>set('password',e.target.value)} className="input-dark pl-11 pr-11" placeholder="Min 6 characters" disabled={loading}/><button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">{showPw?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div></div>
          <div><label className="block text-sm font-medium text-white/70 mb-1">Confirm Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"/><input type="password" required value={form.confirm} onChange={e=>set('confirm',e.target.value)} className="input-dark pl-11" placeholder="Re-enter password" disabled={loading}/></div></div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Account Type</label>
            <select value={form.role} onChange={e=>set('role', e.target.value)} className="input-dark w-full appearance-none" disabled={loading}>
              <option value="client">Client</option>
              <option value="delivery_agent">Delivery Agent</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin"/>Creating account...</> : 'Create Account'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-transparent text-white/30">or continue with</span></div>
          </div>

          {/* Google Sign-Up */}
          <button type="button" onClick={handleGoogleSignup} disabled={loading} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-full border border-white/20 text-white/80 hover:bg-white/5 transition-all duration-300 text-sm font-medium disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <p className="text-center text-white/40 text-sm">Already have an account? <Link to="/login" className="text-brand-gold hover:underline">Sign In</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
