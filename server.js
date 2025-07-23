require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const flightsRouter = require('./routes/flights');
const authRoutes    = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());


const allowedOrigins = [
  'http://localhost:5173',
  'https://flight-search-front-end.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Authentication routes
app.use('/api/auth', authRoutes);

// Flight routes
app.use('/flights', flightsRouter);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(PORT, () => {
      console.log(`REST API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
