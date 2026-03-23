import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CalendarCheck, Truck, LogOut, ChefHat, Menu as MenuIcon, X, Users, TrendingUp, DollarSign, PackagePlus, Edit, Trash2, Shield, UserPlus, Image as ImageIcon, CheckCircle, PackageSearch } from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // for adding users manually
import { db, auth, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700', preparing: 'bg-blue-100 text-blue-700',
  delivering: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
  confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: PackageSearch },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ clients: 0, agents: 0, totalOrders: 0, revenue: 0 });
  const [loadingMap, setLoadingMap] = useState({});

  const { logout } = useAuth();
  const { success, error } = useNotification();

  // Modal states
  const [productModal, setProductModal] = useState({ open: false, data: null });
  const [userModal, setUserModal] = useState({ open: false, data: null });

  // Load Data
  useEffect(() => {
    const unsubs = [];

    // Orders Listener
    unsubs.push(onSnapshot(collection(db, 'orders'), snap => {
      let revenue = 0;
      const o = snap.docs.map(d => {
        const data = d.data();
        if(data.status === 'delivered') revenue += data.total || 0;
        return { id: d.id, ...data };
      }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(o);
      setStats(s => ({ ...s, totalOrders: o.length, revenue }));
    }));

    // Users Listener
    unsubs.push(onSnapshot(collection(db, 'users'), snap => {
      const u = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const clients = u.filter(user => user.role === 'client' || user.role === 'user').length;
      const agents = u.filter(user => user.role === 'delivery_agent').length;
      setUsers(u);
      setStats(s => ({ ...s, clients, agents }));
    }));

    // Products Listener
    unsubs.push(onSnapshot(collection(db, 'menu'), snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  // Set loading for a specific row to true/false
  const setRowLoading = (id, state) => setLoadingMap(p => ({...p, [id]: state}));

  // ================= ORDERS =================
  const updateOrderStatus = async (id, status) => {
    try {
      setRowLoading(id, true);
      await updateDoc(doc(db, 'orders', id), { status, updatedAt: new Date().toISOString() });
      success(`Order ${id} → ${status}`);
    } catch(err) { error('Update failed'); } finally { setRowLoading(id, false); }
  };

  const assignDeliveryAgent = async (orderId, agentId) => {
    if (!agentId) return;
    try {
      setRowLoading(orderId, true);
      await updateDoc(doc(db, 'orders', orderId), { assignedTo: agentId, updatedAt: new Date().toISOString() });
      success('Delivery agent assigned');
    } catch(err) { error('Assignment failed'); } finally { setRowLoading(orderId, false); }
  };

  // ================= PRODUCTS =================
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      name: form.get('name'),
      price: Number(form.get('price')),
      category: form.get('category'),
      description: form.get('description'),
      popular: form.get('popular') === 'on',
      updatedAt: new Date().toISOString()
    };
    
    try {
      setRowLoading('prod_modal', true);
      const imgFile = form.get('image');
      
      // Upload image if provided
      if (imgFile && imgFile.size > 0) {
        const imgRef = ref(storage, `products/${Date.now()}_${imgFile.name}`);
        const snap = await uploadBytes(imgRef, imgFile);
        data.imageURL = await getDownloadURL(snap.ref);
      }

      if (productModal.data?.id) {
        await updateDoc(doc(db, 'menu', productModal.data.id), data);
        success('Product updated');
      } else {
        data.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'menu'), data);
        success('Product created');
      }
      setProductModal({open:false, data:null});
    } catch (err) {
      error('Failed to save product');
      console.error(err);
    } finally {
      setRowLoading('prod_modal', false);
    }
  };

  const deleteProduct = async (id) => {
    if(!window.confirm('Delete this product?')) return;
    try {
      setRowLoading(id, true);
      await deleteDoc(doc(db, 'menu', id));
      success('Product deleted');
    } catch(err) { error('Delete failed'); } finally { setRowLoading(id, false); }
  };

  // ================= USERS =================
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const data = {
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone'),
      role: form.get('role'),
    };
    
    try {
      setRowLoading('user_modal', true);
      
      // We can only *edit* existing user docs securely from here unless we trigger a cloud function or use admin SDK.
      // But we can update the Firestore doc for existing users:
      if (userModal.data?.id) {
        await updateDoc(doc(db, 'users', userModal.data.id), data);
        success('User updated');
        setUserModal({open:false, data:null});
      } else {
        // Warning: Creating a Firebase Auth user from client-side while logged in as Admin 
        // will sign out the Admin and log in the new user in standard SDK.
        // In realprod, use Cloud Function. Here we just add doc to firestore directly or show warning.
        error('Please use the signup form for new users, or implement Firebase Admin SDK in backend for manual creation.');
      }
    } catch(err) { error('Operation failed'); } finally { setRowLoading('user_modal', false); }
  };

  const deleteUserDoc = async (id) => {
    if(!window.confirm('Delete this user record? (Note: Auth account remains)')) return;
    try {
      setRowLoading(id, true);
      await deleteDoc(doc(db, 'users', id));
      success('User record deleted');
    } catch(err) { error('Delete failed'); } finally { setRowLoading(id, false); }
  };

  const toggleUserStatus = async (id, isActive) => {
    try {
      setRowLoading(id, true);
      await updateDoc(doc(db, 'users', id), { disabled: !isActive });
      success(`User account ${!isActive ? 'disabled' : 'enabled'}`);
    } catch(err) { error('Status update failed'); } finally { setRowLoading(id, false); }
  };

  // Agent list for dropdowns
  const deliveryAgents = users.filter(u => u.role === 'delivery_agent');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-brand-green-dark z-50 transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10 mt-4">
            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center"><ChefHat className="w-5 h-5 text-brand-green-dark"/></div>
            <div>
              <p className="text-white font-serif font-bold text-lg leading-tight">RDDB</p>
              <p className="text-brand-gold text-xs font-semibold tracking-wider">ADMIN PORTAL</p>
            </div>
          </div>
          
          <nav className="space-y-2 flex-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} 
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-brand-gold text-brand-green-dark shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-green-dark' : ''}`}/> {tab.label}
              </button>
            ))}
          </nav>
          
          <div className="pt-6 border-t border-white/10">
            <Link to="/" className="w-full flex items-center justify-center gap-2 py-3 text-white/40 hover:text-white text-sm transition-colors mb-2">← Back to Site</Link>
            <button onClick={() => { logout(); window.location.href='/'; }} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-sm transition-all"><LogOut className="w-4 h-4"/> Logout</button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-brand-green-dark text-white shadow-2xl flex items-center justify-center border border-white/10">
        {sidebarOpen ? <X className="w-6 h-6"/> : <MenuIcon className="w-6 h-6"/>}
      </button>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-10 min-w-0 max-h-screen overflow-y-auto">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-brand-black">Dashboard Overview</h1>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4"><Users className="w-6 h-6 text-blue-600"/></div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Clients</p>
                <p className="text-3xl font-bold text-brand-black">{stats.clients}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4"><Truck className="w-6 h-6 text-amber-600"/></div>
                <p className="text-gray-500 text-sm font-medium mb-1">Delivery Agents</p>
                <p className="text-3xl font-bold text-brand-black">{stats.agents}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4"><ShoppingBag className="w-6 h-6 text-purple-600"/></div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-brand-black">{stats.totalOrders}</p>
              </div>
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4"><TrendingUp className="w-6 h-6 text-green-600"/></div>
                <p className="text-gray-500 text-sm font-medium mb-1">Delivered Revenue</p>
                <p className="text-3xl font-bold text-brand-black">{stats.revenue.toLocaleString()} F</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
              <h3 className="font-serif font-bold text-xl mb-6 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></div> Live Orders Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase tracking-wider bg-gray-50/50"><tr className="border-b border-gray-100"><th className="py-4 pl-4 font-semibold">Order ID</th><th className="py-4 font-semibold">Customer</th><th className="py-4 font-semibold">Amount</th><th className="py-4 font-semibold">Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 pl-4 font-mono font-bold text-brand-green text-xs">{o.id}</td>
                        <td className="py-4 font-medium text-gray-800">{o.customerName || o.customer}</td>
                        <td className="py-4 font-semibold">{o.total?.toLocaleString()} F</td>
                        <td className="py-4"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColors[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
              <h1 className="text-3xl font-serif font-bold text-brand-black">Menu Products</h1>
              <button onClick={() => setProductModal({open: true, data: null})} className="flex items-center gap-2 bg-brand-green text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-brand-green/20 hover:scale-[1.02] transition-transform">
                <PackagePlus className="w-5 h-5"/> Add Product
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col group relative overflow-hidden">
                  <div className="aspect-[4/3] rounded-2xl bg-gray-100 mb-4 overflow-hidden relative">
                    {p.imageURL ? <img src={p.imageURL} className="w-full h-full object-cover"/> : <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300"/></div>}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">{p.category}</div>
                  </div>
                  <h3 className="font-bold text-gray-900 leading-tight mb-1 truncate">{p.name}</h3>
                  <p className="text-brand-green font-bold text-lg mb-4">{p.price?.toLocaleString()} FCFA</p>
                  
                  <div className="mt-auto flex gap-2 pt-4 border-t border-gray-50">
                    <button onClick={() => setProductModal({open: true, data: p})} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-medium text-xs transition"><Edit className="w-4 h-4"/> Edit</button>
                    <button onClick={() => deleteProduct(p.id)} disabled={loadingMap[p.id]} className="flex items-center justify-center w-10 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-serif font-bold text-brand-black">User Management</h1>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <tr><th className="py-3 px-4">Name</th><th className="py-3 px-4">Email / Phone</th><th className="py-3 px-4">Role</th><th className="py-3 px-4">Status</th><th className="py-3 px-4 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className={`border-b border-gray-50 ${u.disabled ? 'opacity-50' : ''}`}>
                      <td className="py-3 px-4 font-bold text-gray-800">{u.name}</td>
                      <td className="py-3 px-4"><p>{u.email}</p><p className="text-xs text-gray-400">{u.phone}</p></td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'delivery_agent' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.disabled ? <span className="text-red-500 font-medium text-xs flex items-center gap-1">Disabled</span> : <span className="text-green-500 font-medium text-xs flex items-center gap-1">Active</span>}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button onClick={() => setUserModal({open:true, data:u})} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition"><Edit className="w-4 h-4"/></button>
                        <button onClick={() => toggleUserStatus(u.id, !u.disabled)} className={`p-2 rounded-lg transition ${u.disabled ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}>
                          <Shield className="w-4 h-4"/>
                        </button>
                        <button onClick={() => deleteUserDoc(u.id)} disabled={loadingMap[u.id]} className="p-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* DELIVERIES ASSIGNMENT */}
        {activeTab === 'deliveries' && (
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="space-y-6">
            <h1 className="text-3xl font-serif font-bold text-brand-black">Assign Deliveries</h1>
            <div className="grid gap-4">
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(o => (
                <div key={o.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1"><span className="font-mono text-sm font-bold text-brand-green bg-brand-green/10 px-2 rounded-md">{o.id}</span></div>
                    <p className="font-bold text-gray-800">{o.customerName || o.customer}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{o.deliveryAddress}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-2xl w-full md:w-64">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Assigned Agent</p>
                    <select 
                      value={o.assignedTo || ''} 
                      onChange={(e) => assignDeliveryAgent(o.id, e.target.value)}
                      disabled={loadingMap[o.id]}
                      className="input-field w-full text-sm bg-white"
                    >
                      <option value="">Unassigned</option>
                      {deliveryAgents.map(ag => <option key={ag.id} value={ag.id}>{ag.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Status</p>
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider w-full text-center ${statusColors[o.status] || 'bg-gray-100'}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 text-gray-400">No active orders needing delivery.</div>
              )}
            </div>
          </motion.div>
        )}

      </main>

      {/* MODALS */}
      <AnimatePresence>
        {/* Product Modal */}
        {productModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/40 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-brand-black">{productModal.data ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setProductModal({open:false, data:null})} className="text-gray-400 hover:text-gray-600"><X/></button>
              </div>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div><label className="text-sm font-semibold text-gray-700">Name</label><input name="name" required defaultValue={productModal.data?.name} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green"/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-sm font-semibold text-gray-700">Price (FCFA)</label><input type="number" name="price" required defaultValue={productModal.data?.price} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green"/></div>
                  <div><label className="text-sm font-semibold text-gray-700">Category</label>
                    <select name="category" required defaultValue={productModal.data?.category} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green">
                      <option value="local">Local</option><option value="international">International</option><option value="drinks">Drinks</option>
                    </select>
                  </div>
                </div>
                <div><label className="text-sm font-semibold text-gray-700">Description</label><textarea name="description" required defaultValue={productModal.data?.description} rows="2" className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green"></textarea></div>
                <div><label className="text-sm font-semibold text-gray-700">Product Image (Upload)</label><input type="file" name="image" accept="image/*" className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"/></div>
                <div className="flex items-center gap-2 mt-4"><input type="checkbox" name="popular" id="popular" defaultChecked={productModal.data?.popular} className="w-5 h-5 rounded text-brand-green focus:ring-brand-green"/><label htmlFor="popular" className="font-semibold text-gray-700 select-none">Mark as Popular</label></div>
                <button type="submit" disabled={loadingMap['prod_modal']} className="w-full btn-primary py-4 text-base mt-4 outline-none disabled:opacity-50">{loadingMap['prod_modal'] ? 'Saving...' : 'Save Product'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* User Modal */}
        {userModal.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-black/40 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}} className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif font-bold text-brand-black">Edit User</h2>
                <button onClick={() => setUserModal({open:false, data:null})} className="text-gray-400 hover:text-gray-600"><X/></button>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div><label className="text-sm font-semibold text-gray-700">Name</label><input name="name" required defaultValue={userModal.data?.name} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green"/></div>
                <div><label className="text-sm font-semibold text-gray-700">Phone</label><input name="phone" defaultValue={userModal.data?.phone} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green"/></div>
                <input type="hidden" name="email" value={userModal.data?.email}/>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Role</label>
                  <select name="role" required defaultValue={userModal.data?.role} className="input-field w-full mt-1 bg-gray-50 text-gray-900 border-gray-200 focus:border-brand-green">
                    <option value="client">Client</option><option value="delivery_agent">Delivery Agent</option><option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={loadingMap['user_modal']} className="w-full btn-primary py-4 text-base mt-4 outline-none disabled:opacity-50">{loadingMap['user_modal'] ? 'Saving...' : 'Save User'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
