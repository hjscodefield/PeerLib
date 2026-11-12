import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from '../database/db.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import studentRoutes from './routes/students.js';
import facultyRoutes from './routes/faculty.js';
import statsRoutes from './routes/stats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend production build if present
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'PeerLib - NBKRIST Student Knowledge Network',
    timestamp: new Date().toISOString()
  });
});

// Fallback to React index.html for SPA client-side routing
app.get('*', (req, res) => {
  if (fs.existsSync(frontendDist)) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  } else {
    res.json({ message: 'PeerLib API Server online. Build frontend to view UI.' });
  }
});

// Start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 PeerLib Backend Server is running on http://localhost:${PORT}`);
  });
}

startServer();
