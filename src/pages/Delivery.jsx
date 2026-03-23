import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, ChefHat, Truck, CheckCircle2, MapPin, Clock, Phone } from 'lucide-react';

const steps = [
  { id: 'confirmed', label: 'Order Confirmed', icon: Package, desc: 'Your order has been received' },
  { id: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Chef is crafting your meal' },
  { id: 'delivering', label: 'On the Way', icon: Truck, desc: 'Driver heading to you' },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Enjoy your meal!' },
];

export default function Delivery() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(null);

  const handleTrack = (e) => {
    e.preventDefault();
    // Simulate tracking data
    setTracking({
      id: orderId || 'RDDB-DEMO123',
      status: 'preparing',
      items: ['Ndolé Royal ×1', 'Golden Mango Cocktail ×2'],
      total: '12,000 FCFA',
      address: 'Rue de la Joie, Akwa, Douala',
      driver: 'Emmanuel K.',
      driverPhone: '+237 6XX XXX XXX',
      eta: '35 minutes',
      placedAt: '10:30 AM',
    });
  };

  const getStepIdx = (id) => steps.findIndex(s => s.id === id);
  const currentIdx = tracking ? getStepIdx(tracking.status) : -1;

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-24">
      <div className="bg-brand-green-dark py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="section-subtitle text-brand-gold">Real-time</motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-4xl md:text-6xl font-serif font-bold text-white mb-4">Track Your <span className="gold-gradient">Order</span></motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="text-white/60 max-w-xl mx-auto">Enter your order ID to see real-time status and estimated delivery time.</motion.p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Search */}
        <motion.form initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} onSubmit={handleTrack} className="flex gap-3 mb-12">
          <input value={orderId} onChange={e=>setOrderId(e.target.value)} className="input-field flex-1" placeholder="Enter Order ID (e.g., RDDB-DEMO123)" />
          <button type="submit" className="btn-primary whitespace-nowrap">Track Order</button>
        </motion.form>

        {tracking && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-8">
            {/* Progress Steps */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-serif text-xl font-bold">Order #{tracking.id}</h3>
                <span className="text-sm text-gray-500">Placed at {tracking.placedAt}</span>
              </div>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200 hidden sm:block">
                  <div className="h-full bg-brand-green transition-all duration-700" style={{width: `${(currentIdx / (steps.length-1)) * 100}%`}} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
                  {steps.map((step, i) => {
                    const done = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <div key={step.id} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 flex-shrink-0 ${active ? 'bg-brand-green text-white scale-110 shadow-lg shadow-brand-green/30' : done ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <step.icon className="w-5 h-5" />
                        </div>
                        <div className="sm:text-center">
                          <p className={`text-sm font-semibold ${done ? 'text-brand-green' : 'text-gray-400'}`}>{step.label}</p>
                          <p className="text-xs text-gray-400">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h4 className="font-serif font-bold mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-brand-gold"/>Order Details</h4>
                {tracking.items.map((item,i) => <p key={i} className="text-sm text-gray-600 mb-1">{item}</p>)}
                <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between"><span className="text-gray-500 text-sm">Total</span><span className="font-bold text-brand-green">{tracking.total}</span></div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h4 className="font-serif font-bold mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-brand-gold"/>Delivery Info</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-brand-gold mt-0.5"/><p className="text-sm text-gray-600">{tracking.address}</p></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-gold"/><p className="text-sm text-gray-600">ETA: <strong className="text-brand-green">{tracking.eta}</strong></p></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-gold"/><p className="text-sm text-gray-600">Driver: {tracking.driver}</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
