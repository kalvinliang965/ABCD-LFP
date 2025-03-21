import express from 'express';
import { EventSeries } from '../db/models/eventSeries';

const router = express.Router();

interface MongooseError {
  message: string;
  name: string;
  code?: number;
}

// Get all event series
router.get('/', async (req, res) => {
  try {
    const eventSeries = await EventSeries.find();
    res.json(eventSeries);
  } catch (err) {
    console.error('Failed to fetch event series:', err);
    res.status(500).json({ error: 'Failed to fetch event series' });
  }
});

// Get single event series by ID
router.get('/:id', async (req, res) => {
  try {
    const eventSeries = await EventSeries.findById(req.params.id);
    if (!eventSeries) {
      return res.status(404).json({ error: 'Event series not found' });
    }
    res.json(eventSeries);
  } catch (err) {
    console.error('Failed to fetch event series:', err);
    res.status(500).json({ error: 'Failed to fetch event series' });
  }
});

// Create new event series
router.post('/', async (req, res) => {
  try {
    console.log('Received event data:', req.body);
    
    // Basic validation
    if (!req.body.name || !req.body.type) {
      return res.status(400).json({ 
        error: 'Name and type are required' 
      });
    }

    // Validate based on event type
    if (req.body.type === 'income' || req.body.type === 'expense') {
      if (!req.body.initialAmount || isNaN(Number(req.body.initialAmount))) {
        return res.status(400).json({ 
          error: 'Valid initial amount is required for income/expense events' 
        });
      }
    }

    if (!req.body.startYear || !req.body.startYear.type) {
      return res.status(400).json({ 
        error: 'Start year configuration is required' 
      });
    }

    if (!req.body.duration || !req.body.duration.type) {
      return res.status(400).json({ 
        error: 'Duration configuration is required' 
      });
    }

    // For invest/rebalance events, validate asset allocation
    if ((req.body.type === 'invest' || req.body.type === 'rebalance') && !req.body.assetAllocation) {
      return res.status(400).json({ 
        error: 'Asset allocation is required for invest/rebalance events' 
      });
    }

    const eventSeries = new EventSeries(req.body);
    const savedEvent = await eventSeries.save();
    console.log('Saved event:', savedEvent);
    
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Server error:', err);
    
    // Handle mongoose validation errors
    if (err instanceof Error) {
      const mongoError = err as MongooseError;
      if (mongoError.name === 'ValidationError') {
        return res.status(400).json({ 
          error: mongoError.message 
        });
      }
    }
    
    // Handle unknown errors
    res.status(500).json({ 
      error: 'An unexpected error occurred while saving the event' 
    });
  }
});

// Update event series
router.put('/:id', async (req, res) => {
  try {
    const eventSeries = await EventSeries.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!eventSeries) {
      return res.status(404).json({ error: 'Event series not found' });
    }
    res.json(eventSeries);
  } catch (err) {
    console.error('Failed to update event series:', err);
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    res.status(400).json({ error: 'Failed to update event series' });
  }
});

// Delete event series
router.delete('/:id', async (req, res) => {
  try {
    const eventSeries = await EventSeries.findByIdAndDelete(req.params.id);
    if (!eventSeries) {
      return res.status(404).json({ error: 'Event series not found' });
    }
    res.json({ message: 'Event series deleted successfully' });
  } catch (err) {
    console.error('Failed to delete event series:', err);
    res.status(500).json({ error: 'Failed to delete event series' });
  }
});

export default router; 