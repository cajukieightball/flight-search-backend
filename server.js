require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const flightsRouter = require("./routes/flights");
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',  // your Rearct dev server
  credentials: true
}));

app.use("/flights", flightsRouter);
app.use('/api/auth', authRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(4000, () => {
      console.log("REST API running at http://localhost:4000");
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });


  

