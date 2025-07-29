const Counter = require('../models/counter');

async function getNextReceiptNo(sequenceName = 'loanReceiptNo') {
  try {
    const counter = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }  // Create if not exists
    );
    return counter.seq;
  } catch (err) {
    console.error('Error generating receipt number:', err);
    throw err;
  }
}

async function peekNextReceiptNo(sequenceName = 'loanReceiptNo') {
  try {
    // Find the current counter document without incrementing
    const counter = await Counter.findById(sequenceName);
    const currentSeq = counter ? counter.seq : 0;
    return currentSeq + 1;  // next receiptNo
  } catch (err) {
    console.error('Error peeking receipt number:', err);
    throw err;
  }
}

module.exports = {
  getNextReceiptNo,
  peekNextReceiptNo
};
