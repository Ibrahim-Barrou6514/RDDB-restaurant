import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function Contact() {
  const { success } = useNotification();
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''});
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = e => { e.preventDefault(); success('Message sent successfully!'); setForm({name:'',email:'',subject:'',message:''}); };

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-24">
      <div className="bg-brand-green-dark py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="section-subtitle text-brand-gold">Get in Touch</motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Contact <span className="gold-gradient">Us</span></motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-white/60 max-w-xl mx-auto">We'd love to hear from you. Visit us in Douala or send us a message.</motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
        {/* Info Cards */}
        <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.3}} className="space-y-6">
          {[
            {icon:MapPin, title:'Visit Us', lines:['Rue de la Joie, Akwa','Douala, Cameroon']},
            {icon:Phone, title:'Call Us', lines:['+237 6XX XXX XXX','+237 6YY YYY YYY']},
            {icon:Mail, title:'Email Us', lines:['info@rddb-restaurant.com','reservations@rddb.cm']},
            {icon:Clock, title:'Opening Hours', lines:['Mon-Fri: 11AM – 11PM','Sat-Sun: 10AM – 12AM']},
          ].map((item,i)=>(
            <div key={i} className="bg-white rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 flex items-center justify-center flex-shrink-0"><item.icon className="w-5 h-5 text-brand-green" /></div>
              <div><h3 className="font-serif font-bold text-brand-black mb-1">{item.title}</h3>{item.lines.map((l,j)=><p key={j} className="text-sm text-gray-500">{l}</p>)}</div>
            </div>
          ))}

          {/* Map Placeholder */}
          <div className="bg-brand-green-dark rounded-2xl h-64 flex items-center justify-center overflow-hidden relative">
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop" alt="Map" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-brand-gold mx-auto mb-2" />
                <p className="text-white font-serif font-bold">Akwa, Douala</p>
                <p className="text-white/60 text-sm">Rue de la Joie</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.4}} onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5 h-fit">
          <h3 className="font-serif text-2xl font-bold text-brand-black mb-6">Send a Message</h3>
          <div className="space-y-5">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name</label><input required value={form.name} onChange={e=>set('name',e.target.value)} className="input-field" placeholder="Your name"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" required value={form.email} onChange={e=>set('email',e.target.value)} className="input-field" placeholder="email@example.com"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Subject</label><input required value={form.subject} onChange={e=>set('subject',e.target.value)} className="input-field" placeholder="How can we help?"/></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Message</label><textarea required value={form.message} onChange={e=>set('message',e.target.value)} className="input-field h-32 resize-none" placeholder="Your message..."/></div>
          </div>
          <button type="submit" className="w-full btn-primary mt-6 flex items-center justify-center gap-2"><Send className="w-4 h-4"/>Send Message</button>
        </motion.form>
      </div>
    </div>
  );
}
