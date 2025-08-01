// models/counter.js
const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },   // name of the sequence (e.g., 'loanReceiptNo')
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);
