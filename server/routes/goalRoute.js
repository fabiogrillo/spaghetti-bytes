const express = require("express");
const router = express.Router();
const {
  getGoals,
  getGoalById, 
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

// Route to get all goals
router.get("/", getGoals);

// Route to get a single goal by ID
router.get("/:id", getGoalById);

// Route to create a new goal
router.post("/", createGoal);

// Route to update a goal by ID
router.put("/:id", updateGoal);

// Route to delete a goal by ID
router.delete("/:id", deleteGoal);

module.exports = router;
