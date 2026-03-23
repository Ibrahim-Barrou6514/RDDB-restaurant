import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import MenuPage from './pages/Menu';
import Cart from './pages/Cart';
import Reservation from './pages/Reservation';
import Delivery from './pages/Delivery';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryAgentDashboard from './pages/DeliveryAgentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminSetup from './pages/AdminSetup';

function ProtectedAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedDeliveryAgent({ children }) {
  const { user, isDeliveryAgent, loading } = useAuth();
  if (loading) return null;
  if (!user || !isDeliveryAgent) return <Navigate to="/login" replace />;
  return children;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  if (typeof window !== 'undefined') window.scrollTo(0, 0);
  return null;
}

function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<><Home /><Footer /></>} />
      <Route path="/menu" element={<><MenuPage /><Footer /></>} />
      <Route path="/cart" element={<><Cart /><Footer /></>} />
      <Route path="/reservations" element={<><Reservation /><Footer /></>} />
      <Route path="/delivery" element={<><Delivery /><Footer /></>} />
      <Route path="/contact" element={<><Contact /><Footer /></>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-setup" element={<AdminSetup />} />
      <Route path="/admin/*" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/delivery-agent/*" element={<ProtectedDeliveryAgent><DeliveryAgentDashboard /></ProtectedDeliveryAgent>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Navbar />
            <NotificationToast />
            <ScrollToTop />
            <AnimatedRoutes />
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
