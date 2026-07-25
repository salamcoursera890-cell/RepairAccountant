const express = require('express');
const router = express.Router();
const { query, queryOne } = require('../database');

router.get('/export', async (req, res) => {
  try {
    const [customers, repairs, expenses, incomes, settings] = await Promise.all([
      query('SELECT * FROM customers'),
      query('SELECT * FROM repairs'),
      query('SELECT * FROM expenses'),
      query('SELECT * FROM incomes'),
      query('SELECT * FROM settings'),
    ]);
    res.json({
      customers: customers.rows,
      repairs: repairs.rows,
      expenses: expenses.rows,
      incomes: incomes.rows,
      settings: settings.rows[0] || {},
      exportedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/import', async (req, res) => {
  try {
    const { customers, repairs, expenses, incomes, settings } = req.body;
    await query('DELETE FROM incomes');
    await query('DELETE FROM expenses');
    await query('DELETE FROM repairs');
    await query('DELETE FROM customers');
    await query('DELETE FROM settings');

    if (customers && customers.length) {
      for (const c of customers) {
        await query('INSERT INTO customers (id, name, phone, notes, created_at, updated_at) VALUES (@id, @name, @phone, @notes, @now, @now)', {
          id: c.id, name: c.name, phone: c.phone, notes: c.notes || '', now: c.created_at || new Date().toISOString()
        });
      }
    }
    if (repairs && repairs.length) {
      for (const r of repairs) {
        await query(
          `INSERT INTO repairs (id, repair_number, customer_id, customer_name, customer_phone, device_type, brand, model, problem_description, estimated_cost, final_cost, status, received_date, delivery_date, notes, created_at, updated_at)
          VALUES (@id, @repair_number, @customer_id, @customer_name, @customer_phone, @device_type, @brand, @model, @problem_description, @estimated_cost, @final_cost, @status, @received_date, @delivery_date, @notes, @now, @now)`,
          { id: r.id, repair_number: r.repair_number || r.repairNumber || 0, customer_id: r.customer_id || r.customerId,
            customer_name: r.customer_name || r.customerName, customer_phone: r.customer_phone || r.customerPhone,
            device_type: r.device_type || r.deviceType, brand: r.brand, model: r.model,
            problem_description: r.problem_description || r.problemDescription,
            estimated_cost: r.estimated_cost || r.estimatedCost || 0, final_cost: r.final_cost || r.finalCost || 0,
            status: r.status, received_date: r.received_date || r.receivedDate,
            delivery_date: r.delivery_date || r.deliveryDate || '', notes: r.notes || '',
            now: r.created_at || new Date().toISOString() }
        );
      }
    }
    if (expenses && expenses.length) {
      for (const e of expenses) {
        await query('INSERT INTO expenses (id, title, amount, date, notes, created_at, updated_at) VALUES (@id, @title, @amount, @date, @notes, @now, @now)', {
          id: e.id, title: e.title, amount: e.amount, date: e.date, notes: e.notes || '', now: e.created_at || new Date().toISOString()
        });
      }
    }
    if (incomes && incomes.length) {
      for (const i of incomes) {
        await query('INSERT INTO incomes (id, description, amount, date, created_at, updated_at) VALUES (@id, @description, @amount, @date, @now, @now)', {
          id: i.id, description: i.description, amount: i.amount, date: i.date, now: i.created_at || new Date().toISOString()
        });
      }
    }
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        const strValue = typeof value === 'string' ? value : JSON.stringify(value);
        await query('INSERT INTO settings (key, value) VALUES (@key, @value)', { key, value: strValue });
      }
    }
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/clear', async (req, res) => {
  try {
    await query('DELETE FROM incomes');
    await query('DELETE FROM expenses');
    await query('DELETE FROM repairs');
    await query('DELETE FROM customers');
    res.json({ success: true, message: 'All data cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
