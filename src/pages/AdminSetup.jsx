import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, Loader2, User } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNotification } from '../context/NotificationContext';

export default function AdminSetup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', secretKey: '' });
  const [loading, setLoading] = useState(false);
  const { success, error } = useNotification();
  const nav = useNavigate();

  // In a real production app, this should be enforced via Firebase Security Rules
  // For this demonstration, we use a simple hardcoded secret key standard
  const MASTER_SECRET = "RDDB2026-ADMIN"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (form.secretKey !== MASTER_SECRET) {
      error("Invalid Master Secret Key. Unauthorized.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create account
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // 2. Force admin role into Firestore
      await setDoc(doc(db, 'users', result.user.uid), {
        name: form.name,
        email: form.email,
        phone: '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });

      success('Admin account successfully created in Firestore! 🛡️');
      nav('/admin');
    } catch (err) {
      console.error(err);
      error(err.code === 'auth/email-already-in-use' ? 'Email already exists.' : 'Failed to create admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />

      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8 text-red-500"/>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white mb-2">Admin Setup</h1>
          <p className="text-red-400 text-xs tracking-widest uppercase">High Security Initialization</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Admin Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-black/50 border border-white/5 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" placeholder="Super Admin" disabled={loading}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-black/50 border border-white/5 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" placeholder="admin@domain.com" disabled={loading}/>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1 uppercase tracking-wider">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-black/50 border border-white/5 text-white rounded-xl py-3 pl-11 pr-4 focus:ring-1 focus:ring-red-500 outline-none transition-all text-sm" placeholder="••••••••" disabled={loading}/>
            </div>
          </div>
          <div className="pt-4 border-t border-white/5 mt-4">
            <label className="block text-xs font-bold text-red-400 mb-1 uppercase tracking-wider">Master Secret Key *</label>
            <input type="password" required value={form.secretKey} onChange={e => setForm({...form, secretKey: e.target.value})} className="w-full bg-red-950/20 border border-red-900/30 text-red-200 rounded-xl py-3 px-4 focus:ring-1 focus:ring-red-500 outline-none transition-all text-center tracking-[0.5em] text-sm" placeholder="ENTER SECRET" disabled={loading}/>
            <p className="text-[10px] text-white/30 text-center mt-2">Use "RDDB2026-ADMIN" to authorize creation.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 uppercase tracking-wider text-xs mt-6">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing...</> : 'Initialize Admin Account'}
          </button>
        </form>
        
        <p className="text-center text-white/20 text-xs mt-6">
          <button onClick={() => nav('/admin-login')} className="hover:text-white/50 transition-colors">← Back to Admin Login</button>
        </p>
      </motion.div>
    </div>
  );
}
