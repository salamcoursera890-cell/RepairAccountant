const express = require('express');
const { query, queryOne } = require('../database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach((row) => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      const strValue = typeof value === 'string' ? value : JSON.stringify(value);
      const existing = await queryOne('SELECT key FROM settings WHERE key = @key', { key });
      if (existing) {
        await query('UPDATE settings SET value = @value WHERE key = @key', { key, value: strValue });
      } else {
        await query('INSERT INTO settings (key, value) VALUES (@key, @value)', { key, value: strValue });
      }
    }

    const result = await query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach((row) => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
