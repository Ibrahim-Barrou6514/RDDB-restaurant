import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Truck, UtensilsCrossed, Award, Sparkles } from 'lucide-react';
import { menuData } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

export default function Home() {
  const { addItem } = useCart();
  const { success } = useNotification();
  const popular = menuData.filter(d => d.popular).slice(0, 4);

  const handleAdd = (item) => {
    addItem(item);
    success(`${item.name} added to cart`);
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop"
            alt="Restaurant ambiance"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-brand-green-dark" />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-brand-gold/5 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-brand-gold/10 blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 backdrop-blur-sm mb-8"
          >
            <Sparkles className="w-4 h-4 text-brand-gold" />
            <span className="text-brand-gold text-sm font-medium tracking-wider">PREMIUM DINING EXPERIENCE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 leading-tight"
          >
            Distinction{' '}
            <span className="gold-gradient">Divine</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Where Cameroonian culinary heritage meets world-class gastronomy.
            Every dish tells a story of excellence and passion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/menu" className="btn-primary flex items-center justify-center gap-2 text-base px-10 py-4">
              Order Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/reservations" className="btn-secondary text-base px-10 py-4 text-center">
              Reserve a Table
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-brand-gold rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="bg-brand-green-dark py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: UtensilsCrossed, label: 'Fine Dining', desc: 'Curated experience' },
            { icon: Truck, label: 'Fast Delivery', desc: 'Under 45 mins' },
            { icon: Clock, label: 'Open Daily', desc: '11 AM – 11 PM' },
            { icon: Award, label: 'Top Rated', desc: '4.9 ★ Rating' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={i}
              variants={fadeUp}
              className="flex items-center gap-3 justify-center"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{f.label}</p>
                <p className="text-white/50 text-xs">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="py-24 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="section-subtitle">Our Finest</p>
            <h2 className="section-title">Signature Dishes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Handcrafted with passion, these dishes represent the pinnacle of our culinary artistry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {popular.map((dish, i) => (
              <motion.div
                key={dish.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="card group"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-brand-gold/90 text-[10px] font-bold text-brand-green-dark uppercase">
                    <Star className="w-3 h-3" /> Popular
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-brand-gold font-bold text-lg">{dish.price.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-brand-black mb-1">{dish.name}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{dish.description}</p>
                  <button
                    onClick={() => handleAdd(dish)}
                    className="w-full btn-dark text-xs py-2.5"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              View Full Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section className="py-24 bg-brand-green-dark relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-gold/5 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <p className="section-subtitle">Our Story</p>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">
                A Legacy of{' '}
                <span className="gold-gradient">Excellence</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Founded in the heart of Douala, RDDB brings together the rich flavors of Cameroon
                with international culinary techniques. Our chefs craft each dish with meticulous
                attention to detail, using the finest locally-sourced ingredients.
              </p>
              <p className="text-white/60 leading-relaxed mb-8">
                From our signature Ndolé Royal to our exquisite Wagyu Steak, every plate is a
                masterpiece designed to delight your senses and create unforgettable dining memories.
              </p>
              <Link to="/reservations" className="btn-primary inline-flex items-center gap-2">
                Reserve Your Table <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="grid grid-cols-2 gap-4"
            >
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=400&h=500&fit=crop"
                alt="Chef preparing dish"
                className="rounded-2xl h-64 w-full object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=500&fit=crop"
                alt="Restaurant interior"
                className="rounded-2xl h-64 w-full object-cover mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <p className="section-subtitle">Témoignages</p>
            <h2 className="section-title">Ce que disent nos clients</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ibrahim Barroutech.', text: 'Le Poulet DG était absolument divin. La meilleure expérience culinaire à Douala, tout simplement.', stars: 5 },
              { name: 'ivan sylats.', text: 'Impeccable service, stunning ambiance, and the food is out of this world. A true gem!', stars: 5 },
              { name: 'Aaron.', text: 'Their delivery service is incredibly fast and the food arrives perfectly presented. Love it!', stars: 5 },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="p-8 rounded-2xl bg-brand-cream border border-brand-gold/10"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6 leading-relaxed">"{t.text}"</p>
                <p className="font-serif font-bold text-brand-green">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-brand-black text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-3xl mx-auto px-4"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
            Ready to Experience <span className="gold-gradient">Distinction?</span>
          </h2>
          <p className="text-white/60 mb-10 text-lg">
            Join us for an unforgettable culinary journey. Order online or reserve your table today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu" className="btn-primary text-base px-10 py-4">
              Order Now
            </Link>
            <Link to="/reservations" className="btn-secondary text-base px-10 py-4">
              Book a Table
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
