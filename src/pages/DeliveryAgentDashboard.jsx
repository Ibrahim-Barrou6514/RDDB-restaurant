import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Phone, CheckCircle, Clock, Package, LogOut, Navigation, ChefHat, Eye } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function DeliveryAgentDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { success, error } = useNotification();
  const nav = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    // Listen to orders assigned to this delivery agent
    const q = query(
      collection(db, 'orders'),
      where('assignedTo', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort: active deliveries first, then delivered
      ordersData.sort((a, b) => {
        if (a.status === 'delivered' && b.status !== 'delivered') return 1;
        if (a.status !== 'delivered' && b.status === 'delivered') return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      setDeliveries(ordersData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching deliveries:', err);
      // For demo purposes, if Firestore fails, show mock data
      if (deliveries.length === 0) {
        setDeliveries([
          { id: 'ORD-1001', customerName: 'John Doe', customerPhone: '+237 600000000', deliveryAddress: 'Akwa, Rue Drouot', status: 'delivering', total: 15000, items: [{name: 'Ndolé Royal', quantity: 1}] },
          { id: 'ORD-1002', customerName: 'Jane Smith', customerPhone: '+237 600000001', deliveryAddress: 'Bonapriso, Avenue de Gaulle', status: 'delivered', total: 8500, items: [{name: 'Poulet DG', quantity: 1}] }
        ]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      // Opt: skip firebase call if this is mock data (no real doc)
      if (orderId.startsWith('ORD-')) {
        setDeliveries(prev => prev.map(d => d.id === orderId ? {...d, status: newStatus} : d));
        success(`Status updated to ${newStatus}`);
        return;
      }

      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      success(`Delivery status updated to: ${newStatus.replace('_', ' ')}`);
    } catch (err) {
      console.error('Update err:', err);
      error('Failed to update status.');
    }
  };

  const handleLogout = async () => {
    await logout();
    nav('/login');
  };

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const pastDeliveries = deliveries.filter(d => d.status === 'delivered');

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    preparing: 'bg-blue-100 text-blue-700',
    delivering: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-brand-green-dark pt-20 pb-12 px-4 shadow-lg mb-8 rounded-b-[2.5rem]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center">
              <Truck className="w-7 h-7 text-brand-green-dark"/>
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-white">Livreur Portal</h1>
              <p className="text-white/60 text-sm">Welcome back, {user?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <LogOut className="w-5 h-5"/>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600"/>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-black">{activeDeliveries.length}</p>
              <p className="text-sm text-gray-500 font-medium">Active Tasks</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600"/>
            </div>
            <div>
              <p className="text-3xl font-bold text-brand-black">{pastDeliveries.length}</p>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <h2 className="text-xl font-serif font-bold text-brand-black mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-brand-gold"/> Current Assignments
        </h2>

        {loading ? (
          <div className="text-center py-12"><div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : activeDeliveries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4"/>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No active deliveries</h3>
            <p className="text-gray-500 text-sm">You're all caught up! Wait for new assignments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDeliveries.map(delivery => (
              <motion.div key={delivery.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-green bg-brand-green/10 px-2 py-1 rounded-md">{delivery.id}</span>
                    <h3 className="font-bold text-lg mt-2">{delivery.customerName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[delivery.status] || 'bg-gray-100'}`}>
                    {delivery.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0"/>
                    <p className="text-gray-700 text-sm">{delivery.deliveryAddress}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400 shrink-0"/>
                    <a href={`tel:${delivery.customerPhone}`} className="text-brand-green font-medium text-sm hover:underline">{delivery.customerPhone}</a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  {delivery.status !== 'delivering' && (
                    <button onClick={() => updateStatus(delivery.id, 'delivering')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl font-medium text-sm hover:bg-purple-700 transition">
                      <Navigation className="w-4 h-4"/> Start Delivery
                    </button>
                  )}
                  {delivery.status === 'delivering' && (
                    <button onClick={() => updateStatus(delivery.id, 'delivered')} className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition">
                      <CheckCircle className="w-4 h-4"/> Mark Delivered
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* History */}
        {pastDeliveries.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-serif font-bold text-brand-black mb-4">Recent History</h2>
            <div className="space-y-3">
              {pastDeliveries.map(delivery => (
                <div key={delivery.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between opacity-75">
                  <div>
                    <p className="font-bold text-sm">{delivery.customerName}</p>
                    <p className="text-xs text-gray-500 truncate w-48">{delivery.deliveryAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-green-600 text-xs font-bold uppercase tracking-wider bg-green-50 px-2 py-1 rounded-full">Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
