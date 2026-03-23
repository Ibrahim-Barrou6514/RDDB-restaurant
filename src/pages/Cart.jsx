import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useNotification();
  const [step, setStep] = useState('cart'); // cart | checkout | confirmed
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', address: '', city: 'Douala',
    payment: 'cash', notes: '',
  });

  const deliveryFee = totalPrice > 15000 ? 0 : 1500;
  const grandTotal = totalPrice + deliveryFee;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const orderData = {
        items,
        customerName: form.name,
        customerPhone: form.phone,
        deliveryAddress: `${form.address}, ${form.city}`,
        paymentMethod: form.payment,
        notes: form.notes,
        total: grandTotal,
        subtotal: totalPrice,
        deliveryFee,
        status: 'pending',
        assignedTo: '',
        customerId: user?.uid || 'guest',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      
      success('Order placed successfully! 🎉');
      setStep('confirmed');
      clearCart();
    } catch (err) {
      console.error('Order error:', err);
      error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'confirmed') {
    return (
      <div className="min-h-screen bg-brand-cream pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-bold text-brand-black mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Discover our delicious menu and add items to your cart</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </motion.div>
      </div>
    );
  }

  if (step === 'confirmed') {
    return (
      <div className="min-h-screen bg-brand-cream pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4 max-w-md"
        >
          <div className="w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-brand-green mb-3">Order Confirmed!</h2>
          <p className="text-gray-500 mb-4">
            Your order has been placed successfully. You will receive a confirmation shortly.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Order ID: <span className="font-mono font-bold text-brand-green">{orderId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/delivery" className="btn-primary">Track Order</Link>
            <Link to="/menu" className="btn-secondary">Order More</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link to="/menu" className="inline-flex items-center gap-2 text-brand-green hover:text-brand-green-light transition-colors mb-4 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Menu
          </Link>
          <h1 className="text-4xl font-serif font-bold text-brand-black">
            {step === 'cart' ? 'Your Cart' : 'Checkout'}
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items / Checkout Form */}
          <div className="lg:col-span-2">
            {step === 'cart' ? (
              <div className="space-y-4">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-bold text-brand-black">{item.name}</h3>
                      <p className="text-brand-gold font-semibold text-sm">{item.price.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-bold text-brand-black w-24 text-right text-sm">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </p>
                    <button
                      onClick={() => { removeItem(item.id); info('Item removed'); }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleCheckout}
                className="bg-white rounded-2xl p-8 shadow-sm space-y-6"
              >
                <h3 className="font-serif text-2xl font-bold text-brand-black mb-2">Delivery Details</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="input-field" placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="input-field" placeholder="+237 6XX XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <input
                    required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    className="input-field" placeholder="Street, neighborhood, landmark"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="input-field">
                    <option>Douala</option>
                    <option>Yaoundé</option>
                    <option>Bafoussam</option>
                    <option>Bamenda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { id: 'cash', label: 'Cash on Delivery', icon: Banknote },
                      { id: 'momo', label: 'Mobile Money', icon: Smartphone },
                      { id: 'card', label: 'Card Payment', icon: CreditCard },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setForm({ ...form, payment: pm.id })}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-300 ${
                          form.payment === pm.id
                            ? 'border-brand-gold bg-brand-gold/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <pm.icon className={`w-6 h-6 mx-auto mb-2 ${form.payment === pm.id ? 'text-brand-gold' : 'text-gray-400'}`} />
                        <p className="text-xs font-medium">{pm.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Notes</label>
                  <textarea
                    value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="input-field h-24 resize-none" placeholder="Any special instructions..."
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full btn-primary text-base py-4 disabled:opacity-50">
                  {isSubmitting ? 'Processing...' : `Place Order — ${grandTotal.toLocaleString()} FCFA`}
                </button>
              </motion.form>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
              <h3 className="font-serif text-xl font-bold text-brand-black mb-6">Order Summary</h3>

              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm mb-3">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="border-t border-gray-100 my-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{totalPrice.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} FCFA`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[10px] text-gray-400">Free delivery on orders above 15,000 FCFA</p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="font-serif font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-lg text-brand-green">{grandTotal.toLocaleString()} FCFA</span>
                </div>
              </div>

              {step === 'cart' && (
                <button
                  onClick={() => setStep('checkout')}
                  className="w-full btn-primary mt-6 text-center"
                >
                  Proceed to Checkout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
