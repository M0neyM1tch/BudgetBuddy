export const FREE_LIMIT = 50;

export const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  throw new Error('VITE_API_URL environment variable is required');
}

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
