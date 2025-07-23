const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const Flight = require("../models/Flight");
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Rate-limit all /flights routes
router.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: "Too many requests, try again later.",
  })
);

// GET /flights?from=…&to=…&page=…&limit=…
router.get("/", async (req, res) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const { from, to } = req.query;

    const filter = {};
    if (from) filter.from = new RegExp(`^${from}$`, "i");
    if (to)   filter.to   = new RegExp(`^${to}$`,   "i");

    const total = await Flight.countDocuments(filter);
    const docs  = await Flight
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      limit,
      data: docs.map(f => ({ ...f._doc, id: f._id })),
    });
  } catch (err) {
    console.error("Error fetching flights:", err);
    res.status(500).json({ error: "Failed to fetch flights" });
  }
});

//Protected route - Get flight by ID.. postman testing
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id); 
    if (!flight) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    res.json(flight); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /flights
router.post(
  "/",
  body("from").notEmpty(),
  body("to").notEmpty(),
  body("price").isNumeric(),
  body("airline").notEmpty(),
  body("duration").notEmpty(),
  body("departureTime").isISO8601(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newFlight = new Flight(req.body);
      const savedFlight = await newFlight.save();
      res.status(201).json({ ...savedFlight._doc, id: savedFlight._id });
    } catch (err) {
      console.error("Error creating flight:", err);
      res.status(400).json({ error: "Invalid input" });
    }
  }
);

// DELETE /flights/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Flight.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Flight not found" });
    }
    res.json({ message: "Flight deleted" });
  } catch (err) {
    console.error("Error deleting flight:", err);
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;

