export const FREE_LIMIT = 50;

// Not needed - using Supabase directly
// export const API_BASE = import.meta.env.VITE_API_URL;


export const DEFAULT_CATEGORIES = ['Income', 'Expenses', 'Savings'];

export const BANK_CONFIGS = {
  scotiabank: {
    name: 'Scotiabank',
    dateCol: 'Transaction Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  cibc: {
    name: 'CIBC',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  td: {
    name: 'TD Bank',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  bmo: {
    name: 'BMO',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  rbc: {
    name: 'RBC',
    dateCol: 'Transaction Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  tangerine: {
    name: 'Tangerine',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  simplii: {
    name: 'Simplii Financial',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  desjardins: {
    name: 'Desjardins',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
  national: {
    name: 'National Bank',
    dateCol: 'Date',
    amountCol: 'Amount',
    descCol: 'Description',
  },
};
