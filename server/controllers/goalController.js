const Goal = require("../models/Goal");

// Get all goals with error handling
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get a single goal by ID
const getGoalById = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid goal ID format"
      });
    }

    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({
        code: "404",
        message: "Goal not found"
      });
    }
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal by ID:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const { title, description, steps } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        code: "400",
        message: "Title and description are required."
      });
    }

    const newGoal = new Goal({
      title,
      description,
      steps: steps || []
    });

    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a goal by ID
const updateGoal = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid goal ID format"
      });
    }

    const { title, description, steps } = req.body;

    // Validate at least one field is being updated
    if (!title && !description && !steps) {
      return res.status(400).json({
        code: "400",
        message: "No fields to update"
      });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(steps !== undefined && { steps })
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedGoal) {
      return res.status(404).json({
        code: "404",
        message: "Goal not found"
      });
    }

    res.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a goal by ID
const deleteGoal = async (req, res) => {
  try {
    // Validate ID format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        code: "400",
        message: "Invalid goal ID format"
      });
    }

    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);
    if (!deletedGoal) {
      return res.status(404).json({
        code: "404",
        message: "Goal not found"
      });
    }

    res.json({
      message: "Goal deleted successfully",
      deletedGoal
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({
      code: "500",
      message: "A server error has occurred",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
};