import express from 'express';
import { Investment } from '../db/models/investments';

const router = express.Router();

// Get all investments
router.get('/', async (req, res) => {
  try {
    const investments = await Investment.find();
    res.json(investments);
  } catch (err) {
    console.error('Failed to fetch investments:', err);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Create new investment
router.post('/', async (req, res) => {
  try {
    const investment = new Investment(req.body);
    const savedInvestment = await investment.save();
    res.status(201).json(savedInvestment);
  } catch (err) {
    console.error('Failed to create investment:', err);
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

export default router; 