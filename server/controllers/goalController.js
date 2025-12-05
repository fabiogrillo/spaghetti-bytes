const Goal = require("../models/Goal");
const { body, validationResult } = require('express-validator');

// Validation rules for goal creation/update
const goalValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('steps')
    .optional()
    .isArray().withMessage('Steps must be an array')
];

// Middleware to check validation results
const validateGoal = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Get all goals with pagination
const getGoals = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // max 100 per page

    const goals = await Goal.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const total = await Goal.countDocuments();

    res.json({
      goals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single goal by ID
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    const newGoal = new Goal({ title, description, steps });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a goal by ID
const updateGoal = async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { title, description, steps },
      {
        new: true,
      }
    );
    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a goal by ID
const deleteGoal = async (req, res) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);
    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  goalValidationRules,
  validateGoal,
};
