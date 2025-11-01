const LoanEntry = require('../models/loanEntry');

async function getNextReceiptNo() {
  try {
    const lastEntry = await LoanEntry
      .findOne()
      .sort({ receiptNo: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });

    const next = lastEntry ? Number(lastEntry.receiptNo) + 1 : 1;
    return next;
  } catch (err) {
    console.error('Error generating next receipt number:', err);
    throw err;
  }
}

async function peekNextReceiptNo() {
  try {
    const lastEntry = await LoanEntry
      .findOne()
      .sort({ receiptNo: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });

    return lastEntry ? Number(lastEntry.receiptNo) + 1 : 1;
  } catch (err) {
    console.error('Error peeking next receipt number:', err);
    throw err;
  }
}

module.exports = { getNextReceiptNo, peekNextReceiptNo };
