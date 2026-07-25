const express = require('express');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/summary', async (req, res) => {
  try {
    const totalIncome = await queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM incomes');
    const totalExpenses = await queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    const today = new Date().toISOString().slice(0, 10);
    const todayIncome = await queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM incomes WHERE date = @today', { today });
    const todayExpenses = await queryOne('SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = @today', { today });
    const activeRepairs = await queryOne("SELECT COUNT(*) as count FROM repairs WHERE status NOT IN ('Delivered', 'Cancelled')");
    const totalCustomers = await queryOne('SELECT COUNT(*) as count FROM customers');
    const totalRepairs = await queryOne('SELECT COUNT(*) as count FROM repairs');
    const expenseBreakdown = await query('SELECT title, SUM(amount) as total FROM expenses GROUP BY title ORDER BY total DESC');

    const inc = parseFloat(totalIncome.total) || 0;
    const exp = parseFloat(totalExpenses.total) || 0;

    res.json({
      totalIncome: inc,
      totalExpenses: exp,
      netProfit: inc - exp,
      currentCash: inc - exp,
      todayIncome: parseFloat(todayIncome.total) || 0,
      todayExpenses: parseFloat(todayExpenses.total) || 0,
      activeRepairs: parseInt(activeRepairs.count) || 0,
      totalCustomers: parseInt(totalCustomers.count) || 0,
      totalRepairs: parseInt(totalRepairs.count) || 0,
      expenseBreakdown: expenseBreakdown.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
