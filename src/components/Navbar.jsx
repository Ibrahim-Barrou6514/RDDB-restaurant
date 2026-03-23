import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, ChefHat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/menu', label: 'Menu' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/delivery', label: 'Track Order' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? 'bg-brand-green-dark/95 backdrop-blur-xl shadow-2xl shadow-black/30'
          : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChefHat className="w-5 h-5 text-brand-green-dark" />
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white tracking-wide">RDDB</span>
                <span className="hidden sm:block text-[10px] text-brand-gold uppercase tracking-[0.2em]">
                  Distinction Divine
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg ${isActive(link.path)
                    ? 'text-brand-gold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-gold rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-brand-gold border border-brand-gold/30 rounded-lg hover:bg-brand-gold/10 transition-all duration-300"
                >
                  Admin
                </Link>
              )}

              <Link to="/cart" className="relative p-2 text-white hover:text-brand-gold transition-colors duration-300">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-white/70">{user.name?.split(' ')[0]}</span>
                  <button onClick={logout} className="p-2 text-white/60 hover:text-red-400 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-black bg-brand-gold rounded-full hover:bg-brand-gold-light transition-all duration-300"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-white hover:text-brand-gold transition-colors"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 pt-20 bg-brand-green-dark/98 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center gap-2 p-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`block px-8 py-3 text-lg font-medium rounded-xl transition-all duration-300 ${isActive(link.path)
                      ? 'text-brand-gold bg-brand-gold/10'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-8 pt-8 border-t border-white/10 w-full flex flex-col items-center gap-4">
                {user ? (
                  <>
                    <p className="text-white/60">{user.name}</p>
                    {isAdmin && <Link to="/admin" className="btn-secondary text-xs">Admin Dashboard</Link>}
                    <button onClick={logout} className="text-red-400 text-sm">Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="btn-primary">Login / Sign Up</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
