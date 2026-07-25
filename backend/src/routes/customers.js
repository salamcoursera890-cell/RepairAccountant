const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let result;
    if (search) {
      result = await query('SELECT * FROM customers WHERE name LIKE @search OR phone LIKE @search ORDER BY created_at DESC', { search: `%${search}%` });
    } else {
      result = await query('SELECT * FROM customers ORDER BY created_at DESC');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM customers WHERE id = @id', { id: req.params.id });
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, phone = '', notes = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const id = uuidv4();
    const now = new Date().toISOString();
    await query('INSERT INTO customers (id, name, phone, notes, created_at, updated_at) VALUES (@id, @name, @phone, @notes, @now, @now)', { id, name, phone, notes, now });

    const row = await queryOne('SELECT * FROM customers WHERE id = @id', { id });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM customers WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Customer not found' });

    const { name = cur.name, phone = cur.phone, notes = cur.notes } = req.body;
    const now = new Date().toISOString();
    await query('UPDATE customers SET name = @name, phone = @phone, notes = @notes, updated_at = @now WHERE id = @id', { id: req.params.id, name, phone, notes, now });

    const row = await queryOne('SELECT * FROM customers WHERE id = @id', { id: req.params.id });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM customers WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Customer not found' });

    const customerRepairs = await query('SELECT repair_number, customer_name FROM repairs WHERE customer_id = @id', { id: req.params.id });
    for (const r of customerRepairs.rows) {
      await query('DELETE FROM incomes WHERE description = @desc', { desc: `Repair #${r.repair_number} - ${r.customer_name}` });
    }
    await query('DELETE FROM repairs WHERE customer_id = @id', { id: req.params.id });
    await query('DELETE FROM customers WHERE id = @id', { id: req.params.id });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
