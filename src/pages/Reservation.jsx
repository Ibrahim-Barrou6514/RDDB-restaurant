import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, MessageSquare, CheckCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

const timeSlots = [
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00',
  '18:00','18:30','19:00','19:30','20:00','20:30','21:00',
];

export default function Reservation() {
  const { success } = useNotification();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name:'', email:'', phone:'', date:'', time:'', guests:2, occasion:'', requests:'' });
  const today = new Date().toISOString().split('T')[0];
  const set = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSubmit = e => { e.preventDefault(); success('Table reserved! 🎉'); setSubmitted(true); };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream pt-24 flex items-center justify-center">
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="max-w-md text-center px-4">
          <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-brand-green" /></div>
          <h2 className="text-3xl font-serif font-bold text-brand-green mb-3">Reservation Confirmed!</h2>
          <p className="text-gray-500 mb-6">Table for <strong>{form.guests}</strong> on <strong>{form.date}</strong> at <strong>{form.time}</strong></p>
          <div className="bg-white rounded-2xl p-6 text-left space-y-3 mb-8 shadow-sm">
            <div className="flex justify-between text-sm"><span className="text-gray-500">ID</span><span className="font-mono font-bold text-brand-green">RES-{Date.now().toString(36).toUpperCase()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-medium">{form.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Guests</span><span className="font-medium">{form.guests}</span></div>
          </div>
          <button onClick={()=>{setSubmitted(false);setForm({name:'',email:'',phone:'',date:'',time:'',guests:2,occasion:'',requests:''});}} className="btn-primary">New Reservation</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-24">
      <div className="bg-brand-green-dark py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="section-subtitle text-brand-gold">Book Your Experience</motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Reserve a <span className="gold-gradient">Table</span></motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-white/60 max-w-xl mx-auto">Choose your date, time, and let us handle the rest.</motion.p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4">
        <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><input required value={form.name} onChange={e=>set('name',e.target.value)} className="input-field" placeholder="Your name" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} className="input-field" placeholder="email@example.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label><input required value={form.phone} onChange={e=>set('phone',e.target.value)} className="input-field" placeholder="+237 6XX XXX XXX" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><Calendar className="w-4 h-4 inline mr-1 text-brand-gold"/>Date</label><input type="date" required min={today} value={form.date} onChange={e=>set('date',e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><Clock className="w-4 h-4 inline mr-1 text-brand-gold"/>Time</label><select required value={form.time} onChange={e=>set('time',e.target.value)} className="input-field"><option value="">Select time</option>{timeSlots.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2"><Users className="w-4 h-4 inline mr-1 text-brand-gold"/>Guests</label><select value={form.guests} onChange={e=>set('guests',+e.target.value)} className="input-field">{[1,2,3,4,5,6,7,8,10,12,15,20].map(n=><option key={n} value={n}>{n} {n===1?'Guest':'Guests'}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Occasion</label><select value={form.occasion} onChange={e=>set('occasion',e.target.value)} className="input-field"><option value="">Select</option><option>Birthday</option><option>Anniversary</option><option>Business</option><option>Date Night</option><option>Family</option></select></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2"><MessageSquare className="w-4 h-4 inline mr-1 text-brand-gold"/>Special Requests</label><textarea value={form.requests} onChange={e=>set('requests',e.target.value)} className="input-field h-28 resize-none" placeholder="Allergies, seating preferences..." /></div>
          </div>
          <button type="submit" className="w-full btn-primary text-base py-4 mt-8">Confirm Reservation</button>
          <p className="text-center text-gray-400 text-xs mt-4">Cancel or modify up to 2 hours before</p>
        </motion.form>
      </div>
    </div>
  );
}
