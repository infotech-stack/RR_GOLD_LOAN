const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const { generateNextVoucherNo } = require('../utils/voucherNoUtil');

// Route to add a new expense
router.post('/add', async (req, res) => {
  try {
    const { productName, date, totalRupees, quantity, weight, voucherNo } = req.body;

    // Use shared voucherNo generator from util
    const newVoucherNo = voucherNo || await generateNextVoucherNo();
   

    const newExpense = new Expense({
      productName,
      date,
      totalRupees,
      quantity,
      weight,
      voucherNo: newVoucherNo,
    });

    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to get the next voucher number
router.get('/next-voucher', async (req, res) => {
  try {
    const voucherNo = await generateNextVoucherNo();
    res.status(200).json({ voucherNo });
  } catch (error) {
    console.error('Error fetching voucher number:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Route to update an existing expense
router.put('/edit/:id', async (req, res) => {
  try {
    const { productName, date, totalRupees, quantity, weight } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id, 
      { productName, date, totalRupees, quantity, weight }, 
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Route to delete an expense
router.delete('/delete/:id', async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
