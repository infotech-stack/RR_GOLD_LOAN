const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  rupeesInWords: { type: String, required: true },
  purposeOfAmount: { type: String, required: true },
  receivedSignPath: { type: String},
  authorizedSignPath: { type: String},
  date: { type: Date, default: Date.now }, // New date field
 voucherNo: {
    type: Number,
    required: true,
  }
});

module.exports = mongoose.model('Voucher', VoucherSchema);
