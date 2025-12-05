const express = require("express");
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  goalValidationRules,
  validateGoal,
} = require("../controllers/goalController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Route to get all goals
router.get("/", getGoals);

// Route to get a single goal by ID
router.get("/:id", getGoalById);

// Route to create a new goal (protected - admin only, with validation)
router.post("/", requireAuth, requireAdmin, goalValidationRules, validateGoal, createGoal);

// Route to update a goal by ID (protected - admin only, with validation)
router.put("/:id", requireAuth, requireAdmin, goalValidationRules, validateGoal, updateGoal);

// Route to delete a goal by ID (protected - admin only)
router.delete("/:id", requireAuth, requireAdmin, deleteGoal);

module.exports = router;
