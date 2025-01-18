import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js'

// Configuración inicial
dotenv.config();
connectDB();
const app = express();

app.use(cors());
const allowedOrigins = [
  'https://petsqr.netlify.app',
  'https://serverpetsqr.onrender.com',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost',
  'http://127.0.0.1:5500'
];

const corsConfig = cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
app.use(express.json());

// Rutas
app.use('/api/productos', productRoutes);
app.use('/api/carrito', cartRoutes);
app.use('/api/ventas', ventaRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
