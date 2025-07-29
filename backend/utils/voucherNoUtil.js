const Expense = require('../models/expense');
const Salary = require('../models/salary');
const PaidVoucher = require('../models/paidvouchers');
const Voucher = require('../models/voucher');

const getMaxVoucherNo = async (Model) => {
  const result = await Model.aggregate([
    {
      $match: { voucherNo: { $exists: true, $ne: null } }
    },
    {
      $project: {
        voucherNoNum: { $toInt: '$voucherNo' }
      }
    },
    {
      $sort: { voucherNoNum: -1 }
    },
    {
      $limit: 1
    }
  ]);

  if (result.length === 0) return 0;
  return result[0].voucherNoNum || 0;
};

const generateNextVoucherNo = async () => {
  try {
    const maxExpenseVoucher = await getMaxVoucherNo(Expense);
    const maxSalaryVoucher = await getMaxVoucherNo(Salary);
    const maxPaidVoucher = await getMaxVoucherNo(PaidVoucher);
    const maxVoucher = await getMaxVoucherNo(Voucher);

    const newVoucherNo = Math.max(maxExpenseVoucher, maxSalaryVoucher, maxPaidVoucher, maxVoucher) + 1;

    return newVoucherNo;
  } catch (error) {
    console.error('Error generating voucher number:', error);
    throw new Error('Failed to generate voucher number');
  }
};

module.exports = { generateNextVoucherNo };
