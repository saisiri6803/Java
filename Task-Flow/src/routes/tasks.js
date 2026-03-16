const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getTaskById, createTask, updateTask, deleteTask, getStats,
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required.')
               .isLength({ max: 200 }).withMessage('Title max 200 characters.'),
  body('status').optional().isIn(['todo', 'in_progress', 'done'])
                .withMessage('Status must be todo, in_progress, or done.'),
  body('priority').optional().isIn(['low', 'medium', 'high'])
                  .withMessage('Priority must be low, medium, or high.'),
  body('due_date').optional({ nullable: true })
                  .isISO8601().withMessage('due_date must be a valid ISO date.'),
  body('tags').optional().isArray().withMessage('tags must be an array.'),
];

router.get('/stats',  getStats);
router.get('/',       getTasks);
router.get('/:id',    getTaskById);
router.post('/',      taskValidation, createTask);
router.put('/:id',    taskValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
