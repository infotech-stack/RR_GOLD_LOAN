// utils/voucherUtils.js
import axios from 'axios';

export const fetchNextVoucherNo = async () => {
  const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/expenses/next-voucher`);
  sessionStorage.setItem('currentVoucherNo', res.data.voucherNo);
  return res.data.voucherNo;
};
