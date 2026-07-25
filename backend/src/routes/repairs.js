const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let sqlText = 'SELECT * FROM repairs';
    const conditions = [];
    const params = {};

    if (search) {
      conditions.push('(customer_name LIKE @search OR brand LIKE @search OR model LIKE @search)');
      params.search = `%${search}%`;
    }
    if (status) {
      conditions.push('status = @status');
      params.status = status;
    }

    if (conditions.length > 0) {
      sqlText += ' WHERE ' + conditions.join(' AND ');
    }
    sqlText += ' ORDER BY created_at DESC';

    const result = await query(sqlText, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await queryOne('SELECT * FROM repairs WHERE id = @id', { id: req.params.id });
    if (!row) return res.status(404).json({ error: 'Repair not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      customerId, customerName, customerPhone = '',
      deviceType, brand = '', model = '',
      problemDescription = '', estimatedCost = 0, finalCost = 0,
      status = 'Received', receivedDate, deliveryDate = '', notes = ''
    } = req.body;

    if (!customerId || !customerName || !deviceType) {
      return res.status(400).json({ error: 'customerId, customerName, and deviceType are required' });
    }

    const counterRow = await queryOne("SELECT value FROM settings WHERE key = 'repairCounter'");
    const repairNumber = parseInt(counterRow.value) + 1;
    await query("UPDATE settings SET value = @val WHERE key = 'repairCounter'", { val: String(repairNumber) });

    const id = uuidv4();
    const now = new Date().toISOString();
    const date = receivedDate || now;

    await query(
      `INSERT INTO repairs (id, repair_number, customer_id, customer_name, customer_phone,
        device_type, brand, model, problem_description, estimated_cost, final_cost,
        status, received_date, delivery_date, notes, created_at, updated_at)
      VALUES (@id, @repair_number, @customer_id, @customer_name, @customer_phone,
        @device_type, @brand, @model, @problem_description, @estimated_cost, @final_cost,
        @status, @received_date, @delivery_date, @notes, @now, @now)`,
      { id, repair_number: repairNumber, customer_id: customerId, customer_name: customerName, customer_phone: customerPhone,
        device_type: deviceType, brand, model, problem_description: problemDescription,
        estimated_cost: estimatedCost, final_cost: finalCost, status, received_date: date,
        delivery_date: deliveryDate, notes, now }
    );

    if (estimatedCost > 0) {
      const incomeId = uuidv4();
      const today = now.slice(0, 10);
      await query(
        `INSERT INTO incomes (id, description, amount, date, created_at, updated_at)
        VALUES (@id, @description, @amount, @date, @now, @now)`,
        { id: incomeId, description: `Repair #${repairNumber} - ${customerName}`, amount: estimatedCost, date: today, now }
      );
    }

    const row = await queryOne('SELECT * FROM repairs WHERE id = @id', { id });
    res.status(201).json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM repairs WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Repair not found' });

    const {
      deviceType = cur.device_type,
      brand = cur.brand,
      model = cur.model,
      problemDescription = cur.problem_description,
      estimatedCost = cur.estimated_cost,
      finalCost = cur.final_cost,
      status = cur.status,
      deliveryDate = cur.delivery_date,
      notes = cur.notes,
      customerName = cur.customer_name,
      customerPhone = cur.customer_phone
    } = req.body;

    const now = new Date().toISOString();
    await query(
      `UPDATE repairs SET device_type = @device_type, brand = @brand, model = @model,
        problem_description = @problem_description, estimated_cost = @estimated_cost,
        final_cost = @final_cost, status = @status, delivery_date = @delivery_date,
        notes = @notes, customer_name = @customer_name, customer_phone = @customer_phone,
        updated_at = @now
      WHERE id = @id`,
      { id: req.params.id, device_type: deviceType, brand, model, problem_description: problemDescription,
        estimated_cost: estimatedCost, final_cost: finalCost, status, delivery_date: deliveryDate,
        notes, customer_name: customerName, customer_phone: customerPhone, now }
    );

    if (status === 'Delivered' && finalCost > 0 && cur.status !== 'Delivered') {
      const incomeId = uuidv4();
      const today = now.slice(0, 10);
      await query(
        `INSERT INTO incomes (id, description, amount, date, created_at, updated_at)
        VALUES (@id, @description, @amount, @date, @now, @now)`,
        { id: incomeId, description: `Repair #${cur.repair_number} - ${customerName}`, amount: finalCost, date: today, now }
      );
    }

    const row = await queryOne('SELECT * FROM repairs WHERE id = @id', { id: req.params.id });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await queryOne('SELECT * FROM repairs WHERE id = @id', { id: req.params.id });
    if (!cur) return res.status(404).json({ error: 'Repair not found' });

    await query('DELETE FROM repairs WHERE id = @id', { id: req.params.id });
    await query('DELETE FROM incomes WHERE description = @desc', { desc: `Repair #${cur.repair_number} - ${cur.customer_name}` });
    res.json({ message: 'Repair deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
