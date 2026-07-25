const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    let result;
    if (from && to) {
      result = await query('SELECT * FROM incomes WHERE date BETWEEN @from AND @to ORDER BY date DESC', { from, to });
    } else {
      result = await query('SELECT * FROM incomes ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM incomes WHERE id = @id', { id: req.params.id });
    if (!row) return res.status(404).json({ error: 'Income not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { description, amount = 0, date } = req.body;
    if (!description || !date) return res.status(400).json({ error: 'Description and date are required' });

    const id = uuidv4();
    const now = new Date().toISOString();
    await query('INSERT INTO incomes (id, description, amount, date, created_at, updated_at) VALUES (@id, @description, @amount, @date, @now, @now)', { id, description, amount, date, now });

    const row = await queryOne('SELECT * FROM incomes WHERE id = @id', { id });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM incomes WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Income not found' });

    const { description = cur.description, amount = cur.amount, date = cur.date } = req.body;
    const now = new Date().toISOString();
    await query('UPDATE incomes SET description = @description, amount = @amount, date = @date, updated_at = @now WHERE id = @id', { id: req.params.id, description, amount, date, now });

    const row = await queryOne('SELECT * FROM incomes WHERE id = @id', { id: req.params.id });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM incomes WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Income not found' });

    await query('DELETE FROM incomes WHERE id = @id', { id: req.params.id });
    res.json({ message: 'Income deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
