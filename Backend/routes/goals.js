const express = require('express');
const { body, validationResult } = require('express-validator');
const Goal = require('../models/Goal');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const { calculateSIPForGoal } = require('../services/financial');

const router = express.Router();

router.use(auth);

const goalValidation = [
  body('name').trim().notEmpty().withMessage('Goal name is required'),
  body('targetAmount').isNumeric().withMessage('Target amount must be a number'),
];

// ─── GET /api/goals ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId }).sort({ priority: -1, createdAt: -1 });

    // Enrich with SIP data using profile's expected return
    const profile = await Profile.findOne({ userId: req.userId });
    const expectedReturn = 12; // default 12% p.a.

    const enriched = goals.map((g) => {
      const obj = g.toObject();
      if (!g.isCompleted && g.targetDate) {
        const monthsLeft = Math.max(
          1,
          Math.round((new Date(g.targetDate) - Date.now()) / (1000 * 60 * 60 * 24 * 30))
        );
        obj.monthsLeft = monthsLeft;
        obj.sipRequired = calculateSIPForGoal(g.targetAmount, g.savedAmount, expectedReturn, monthsLeft / 12);
        obj.progressPercent = Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100));
      }
      return obj;
    });

    res.json({ goals: enriched });
  } catch (err) {
    console.error('Get goals error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── POST /api/goals ──────────────────────────────────────────────────────
router.post('/', goalValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  try {
    const { name, targetAmount, savedAmount, targetDate, priority, category, notes } = req.body;
    const goal = await Goal.create({
      userId: req.userId,
      name,
      targetAmount,
      savedAmount: savedAmount || 0,
      targetDate: targetDate || null,
      priority: priority || 'medium',
      category: category || 'other',
      notes: notes || '',
    });
    res.status(201).json({ goal });
  } catch (err) {
    console.error('Create goal error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── GET /api/goals/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ goal });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PUT /api/goals/:id ───────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const allowedFields = ['name', 'targetAmount', 'savedAmount', 'targetDate', 'priority', 'category', 'notes', 'isCompleted'];
    const updates = {};
    allowedFields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ goal });
  } catch (err) {
    console.error('Update goal error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── DELETE /api/goals/:id ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
