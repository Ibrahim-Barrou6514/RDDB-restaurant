import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with MongoDB in production)
let users = [
  { id: '1', name: 'Admin', email: 'admin@rddb.cm', password: 'admin123', role: 'admin' }
];
let orders = [];
let reservations = [];
let orderIdCounter = 1000;
let resIdCounter = 100;

// =============== AUTH ROUTES ===============

app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password } = req.body;
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already exists' });
  const user = { id: String(users.length + 1), name, email, phone, password, role: 'user' };
  users.push(user);
  const { password: _, ...safe } = user;
  res.status(201).json({ user: safe, token: 'jwt-' + user.id });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const { password: _, ...safe } = user;
  res.json({ user: safe, token: 'jwt-' + user.id });
});

// =============== MENU ROUTES ===============

import { menuData } from './data/menu.js';

app.get('/api/menu', (req, res) => {
  const { category } = req.query;
  let items = menuData;
  if (category && category !== 'all') items = items.filter(i => i.category === category);
  res.json(items);
});

// =============== ORDER ROUTES ===============

app.post('/api/orders', (req, res) => {
  const { items, customer, address, city, payment, notes } = req.body;
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryFee = total > 15000 ? 0 : 1500;
  const order = {
    id: `ORD-${++orderIdCounter}`,
    items, customer, address, city, payment, notes,
    total, deliveryFee, grandTotal: total + deliveryFee,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => res.json(orders));

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  res.json(order);
});

// =============== RESERVATION ROUTES ===============

app.post('/api/reservations', (req, res) => {
  const { name, email, phone, date, time, guests, occasion, requests } = req.body;
  const reservation = {
    id: `RES-${++resIdCounter}`,
    name, email, phone, date, time, guests, occasion, requests,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  reservations.push(reservation);
  res.status(201).json(reservation);
});

app.get('/api/reservations', (req, res) => res.json(reservations));

app.patch('/api/reservations/:id/status', (req, res) => {
  const r = reservations.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Reservation not found' });
  r.status = req.body.status;
  res.json(r);
});

app.delete('/api/reservations/:id', (req, res) => {
  reservations = reservations.filter(r => r.id !== req.params.id);
  res.json({ success: true });
});

// =============== HEALTH ===============

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'RDDB API', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`\n🍽️  RDDB API Server running on http://localhost:${PORT}`);
  console.log(`📋 Endpoints: /api/auth, /api/menu, /api/orders, /api/reservations\n`);
});
