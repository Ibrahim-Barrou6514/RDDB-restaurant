import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNotification } from '../context/NotificationContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Authenticate user
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Verify admin role in Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      let isAdmin = false;
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        isAdmin = true;
      } else if (result.user.email?.toLowerCase().includes('admin')) {
        isAdmin = true; // Fallback
      }

      if (isAdmin) {
        success('Admin access granted! 🛡️');
        nav('/admin');
      } else {
        // Not an admin, sign them out immediately
        await auth.signOut();
        error('Access denied. This account does not have admin privileges.');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'permission-denied') {
        error('FIREBASE RULES ERROR: You must allow read/write in Firebase Console -> Firestore -> Rules!');
      } else {
        error('Invalid admin credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-[100px]" />

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-gold to-yellow-600 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <Shield className="w-10 h-10 text-white"/>
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all placeholder:text-white/20" 
                placeholder="admin@rddb.cm" 
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-black/50 border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all placeholder:text-white/20" 
                placeholder="••••••••" 
                disabled={loading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-brand-gold to-yellow-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-4"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Authenticating...</> : 'Secure Login'}
          </button>
        </form>
        
        <p className="text-center text-white/20 text-xs mt-8">
          Need an admin account? <button onClick={() => nav('/admin-setup')} className="hover:text-white/50 underline transition-colors">Create one securely</button>.
        </p>
      </motion.div>
    </div>
  );
}
