const { validationResult } = require('express-validator');
const Task = require('../models/Task');

async function getTasks(req, res) {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status)   filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function getTaskById(req, res) {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, data: { task } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, status, priority, due_date, tags } = req.body;
    const task = await Task.create({
      user: req.user._id,
      title: title.trim(),
      description: description?.trim() || null,
      status:   status   || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
      tags:     tags     || [],
    });

    res.status(201).json({ success: true, message: 'Task created.', data: { task } });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function updateTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, description, status, priority, due_date, tags } = req.body;

    const updates = {};
    if (title       !== undefined) updates.title       = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (status      !== undefined) updates.status      = status;
    if (priority    !== undefined) updates.priority    = priority;
    if (due_date    !== undefined) updates.due_date    = due_date;
    if (tags        !== undefined) updates.tags        = tags;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task updated.', data: { task } });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    console.error('updateTask error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function deleteTask(req, res) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

async function getStats(req, res) {
  try {
    const userId = req.user._id;
    const now = new Date();

    const [byStatus, byPriority, overdueCount] = await Promise.all([
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments({
        user: userId,
        due_date: { $lt: now },
        status: { $ne: 'done' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          byStatus:   Object.fromEntries(byStatus.map(r => [r._id, r.count])),
          byPriority: Object.fromEntries(byPriority.map(r => [r._id, r.count])),
          overdue:    overdueCount,
        },
      },
    });
  } catch (err) {
    console.error('getStats error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getStats };
