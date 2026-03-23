import { Link } from 'react-router-dom';
import { ChefHat, Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-green-dark text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-brand-green-dark" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold">RDDB</h3>
                <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em]">Distinction Divine</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Experience culinary excellence at Restaurant Distinction Divine Barroutech. 
              Where tradition meets innovation in every dish.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:text-brand-green-dark transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-brand-gold font-semibold uppercase tracking-wider text-sm mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { path: '/menu', label: 'Our Menu' },
                { path: '/reservations', label: 'Reservations' },
                { path: '/delivery', label: 'Track Delivery' },
                { path: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/60 hover:text-brand-gold transition-colors duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-brand-gold font-semibold uppercase tracking-wider text-sm mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm">Rue de la Joie, Akwa<br />Douala, Cameroon</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span className="text-white/60 text-sm">+237 6XX XXX XXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span className="text-white/60 text-sm">info@rddb-restaurant.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-brand-gold font-semibold uppercase tracking-wider text-sm mb-6">Opening Hours</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Mon - Fri</p>
                  <p className="text-white/50 text-xs">11:00 AM - 11:00 PM</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">Sat - Sun</p>
                  <p className="text-white/50 text-xs">10:00 AM - 12:00 AM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-xs">
            © 2026 Restaurant Distinction Divine Barroutech. All rights reserved.
          </p>
          <p className="text-white/30 text-xs">
            Crafted with ♥ by Barroutech
          </p>
        </div>
      </div>
    </footer>
  );
}
