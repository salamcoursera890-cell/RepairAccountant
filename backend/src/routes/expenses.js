const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    let result;
    if (from && to) {
      result = await query('SELECT * FROM expenses WHERE date BETWEEN @from AND @to ORDER BY date DESC', { from, to });
    } else {
      result = await query('SELECT * FROM expenses ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM expenses WHERE id = @id', { id: req.params.id });
    if (!row) return res.status(404).json({ error: 'Expense not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, amount = 0, date, notes = '' } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const id = uuidv4();
    const now = new Date().toISOString();
    await query('INSERT INTO expenses (id, title, amount, date, notes, created_at, updated_at) VALUES (@id, @title, @amount, @date, @notes, @now, @now)', { id, title, amount, date, notes, now });

    const row = await queryOne('SELECT * FROM expenses WHERE id = @id', { id });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM expenses WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Expense not found' });

    const { title = cur.title, amount = cur.amount, date = cur.date, notes = cur.notes } = req.body;
    const now = new Date().toISOString();
    await query('UPDATE expenses SET title = @title, amount = @amount, date = @date, notes = @notes, updated_at = @now WHERE id = @id', { id: req.params.id, title, amount, date, notes, now });

    const row = await queryOne('SELECT * FROM expenses WHERE id = @id', { id: req.params.id });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM expenses WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Expense not found' });

    await query('DELETE FROM expenses WHERE id = @id', { id: req.params.id });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
