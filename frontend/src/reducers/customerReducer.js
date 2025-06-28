// src/reducers/customerReducer.js
const initialState = {
  customerDetails: null,
  paymentEntries: [],
  error: null,
};

const customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_CUSTOMER_DETAILS':
      return {
        ...state,
        customerDetails: action.payload,
      };
    case 'SET_PAYMENT_ENTRIES':
      return {
        ...state,
        paymentEntries: action.payload,
      };
    case 'FETCH_PAYMENT_ENTRIES_FAILURE':
      console.error('Error fetching payment entries:', action.payload);
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default customerReducer;
