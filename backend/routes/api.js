const express = require('express');
const router = express.Router();
const Form = require('../models/form');
const axios = require('axios');

// Submit form
router.post('/submit', async (req, res) => {
  try {
    const { name, email, balance } = req.body;

    if (!name || !email || balance === undefined) {
      return res.status(400).json({ error: 'Name, email, and balance are required.' });
    }
    const newForm = new Form({ name, email, balance });
    await newForm.save();

    // Send Pushbullet notification
    const { option, paymentMethod, phone, instaUser, image, num } = req.body;

    if (!option || !paymentMethod || !phone || !instaUser || !image || !num) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    await axios.post(
      'https://api.pushbullet.com/v2/pushes',
      {
      type: 'note',
      title: 'New Form Submission',
      body: `Option: ${option}\nPayment Method: ${paymentMethod}\nPhone: ${phone}\nInstagram User: ${instaUser}\nImage: ${image}\nNumber: ${num}`,
      },
      {
      headers: {
        'Access-Token': process.env.PUSHBULLET_TOKEN,
        'Content-Type': 'application/json',
      },
      }
    );

    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all submissions (optional)
router.get('/submissions', async (req, res) => {
  try {
    const forms = await Form.find();
    res.json(forms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;