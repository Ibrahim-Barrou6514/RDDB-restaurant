import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';
import { menuData, categories } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const { addItem } = useCart();
  const { success } = useNotification();

  let filtered = activeCategory === 'all'
    ? menuData
    : menuData.filter(d => d.category === activeCategory);

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  const handleAdd = (item) => {
    addItem(item);
    success(`${item.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-brand-cream pt-24">
      {/* Header */}
      <div className="bg-brand-green-dark py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="section-subtitle text-brand-gold">
            Explore
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif font-bold text-white mb-4"
          >
            Our <span className="gold-gradient">Menu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 max-w-xl mx-auto"
          >
            Discover authentic Cameroonian flavors and exquisite international cuisine
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row gap-4 mb-10"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.id
                    ? 'bg-brand-green text-white shadow-lg shadow-brand-green/30'
                    : 'bg-white text-gray-600 hover:bg-brand-green/10 border border-gray-200'
                }`}
              >
                <span className="mr-1.5">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input-field w-auto min-w-[160px]"
          >
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </motion.div>

        {/* Results Count */}
        <p className="text-gray-500 text-sm mb-6">
          Showing <span className="font-semibold text-brand-green">{filtered.length}</span> dishes
        </p>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((dish, i) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="card group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {dish.popular && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-brand-gold text-[10px] font-bold uppercase text-brand-green-dark rounded-full">
                      ★ Popular
                    </span>
                  )}

                  <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-brand-green rounded-full capitalize">
                    {dish.category}
                  </span>

                  <div className="absolute bottom-3 left-4">
                    <p className="text-2xl font-bold text-white">
                      {dish.price.toLocaleString()}
                      <span className="text-sm text-brand-gold ml-1">FCFA</span>
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-xl font-bold text-brand-black mb-2">{dish.name}</h3>
                  <p className="text-gray-500 text-sm mb-5 line-clamp-2">{dish.description}</p>
                  <button
                    onClick={() => handleAdd(dish)}
                    className="w-full flex items-center justify-center gap-2 bg-brand-green text-white font-semibold py-3 rounded-xl hover:bg-brand-green-light transition-all duration-300 active:scale-95 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No dishes found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
