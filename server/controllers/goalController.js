const Goal = require("../models/Goal");

// Get all goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
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
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required." });
    }
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
};
