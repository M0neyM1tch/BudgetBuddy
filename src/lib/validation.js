/**
 * Sanitizes string input to prevent XSS attacks
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

/**
 * Validates transaction data before sending to Supabase
 */
export const validateTransaction = (data) => {
  const errors = {};
  const sanitized = { ...data };

  // 1. Validate description
  if (!data.description || typeof data.description !== 'string') {
    errors.description = 'Description is required';
  } else if (data.description.trim().length === 0) {
    errors.description = 'Description cannot be empty';
  } else if (data.description.length > 200) {
    errors.description = 'Description must be less than 200 characters';
  } else {
    sanitized.description = sanitizeString(data.description);
  }

  // 2. Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required';
  } else {
    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount)) {
      errors.amount = 'Amount must be a valid number';
    } else if (Math.abs(numAmount) > 10000000) {
      errors.amount = 'Amount exceeds maximum ($10M)';
    } else if (numAmount === 0) {
      errors.amount = 'Amount cannot be zero';
    } else {
      sanitized.amount = numAmount;
    }
  }

  // 3. Validate date
  if (!data.date) {
    errors.date = 'Date is required';
  } else {
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.date = 'Invalid date format';
    } else {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (dateObj > today) {
        errors.date = 'Date cannot be in the future';
      }
      // Check if date is too old (e.g., before 1900)
      const minDate = new Date('1900-01-01');
      if (dateObj < minDate) {
        errors.date = 'Date is too far in the past';
      }
      sanitized.date = data.date;
    }
  }

  // 4. Validate category
  if (!data.category || typeof data.category !== 'string') {
    errors.category = 'Category is required';
  } else if (data.category.length > 50) {
    errors.category = 'Category name too long';
  } else {
    sanitized.category = sanitizeString(data.category);
  }

  // 5. Remove any unexpected fields (prevent mass assignment)
  const allowedFields = ['description', 'amount', 'date', 'category', 'is_recurring', 'recurring_rule_id'];
  Object.keys(sanitized).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete sanitized[key];
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

/**
 * Validates goal data
 */
export const validateGoal = (data) => {
  const errors = {};
  const sanitized = { ...data };

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.name = 'Goal name is required';
  } else if (data.name.trim().length === 0) {
    errors.name = 'Goal name cannot be empty';
  } else if (data.name.length > 100) {
    errors.name = 'Goal name too long (max 100 chars)';
  } else {
    sanitized.name = sanitizeString(data.name);
  }

  // Validate target amount
  if (data.target_amount === undefined || data.target_amount === null) {
    errors.target_amount = 'Target amount is required';
  } else {
    const numAmount = parseFloat(data.target_amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.target_amount = 'Target amount must be positive';
    } else if (numAmount > 100000000) {
      errors.target_amount = 'Target amount too large';
    } else {
      sanitized.target_amount = numAmount;
    }
  }

  // Validate current amount (optional, defaults to 0)
  if (data.current_amount !== undefined && data.current_amount !== null) {
    const numAmount = parseFloat(data.current_amount);
    if (isNaN(numAmount) || numAmount < 0) {
      errors.current_amount = 'Current amount must be non-negative';
    } else {
      sanitized.current_amount = numAmount;
    }
  } else {
    sanitized.current_amount = 0; // ✅ Default to 0
  }

  // Validate deadline (optional)
  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = 'Invalid deadline date';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        errors.deadline = 'Deadline cannot be in the past';
      }
      sanitized.deadline = data.deadline;
    }
  } else {
    sanitized.deadline = null; // ✅ Explicitly set null
  }

  // Validate category (optional, defaults to 🎯)
  if (data.category) {
    sanitized.category = sanitizeString(data.category);
  } else {
    sanitized.category = '🎯';
  }

  // ✅ ALLOW color and created_at (don't strip them out)
  // Remove unexpected fields EXCEPT color and created_at
  const allowedFields = [
    'name', 
    'target_amount', 
    'current_amount', 
    'deadline', 
    'category',
    'color',          // ✅ Added
    'created_at'      // ✅ Added
  ];
  
  Object.keys(sanitized).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete sanitized[key];
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};


/**
 * Validates recurring rule data
 */
export const validateRecurringRule = (data) => {
  const errors = {};
  const sanitized = { ...data };

  // Validate description
  if (!data.description || typeof data.description !== 'string') {
    errors.description = 'Description is required';
  } else if (data.description.trim().length === 0) {
    errors.description = 'Description cannot be empty';
  } else if (data.description.length > 200) {
    errors.description = 'Description too long';
  } else {
    sanitized.description = sanitizeString(data.description);
  }

  // Validate amount
  if (data.amount === undefined || data.amount === null) {
    errors.amount = 'Amount is required';
  } else {
    const numAmount = parseFloat(data.amount);
    if (isNaN(numAmount) || numAmount === 0) {
      errors.amount = 'Amount must be non-zero';
    } else if (Math.abs(numAmount) > 1000000) {
      errors.amount = 'Amount exceeds maximum';
    } else {
      sanitized.amount = numAmount;
    }
  }

  // Validate frequency
  const validFrequencies = ['monthly', 'biweekly'];
  if (!validFrequencies.includes(data.frequency)) {
    errors.frequency = 'Invalid frequency';
  }

  // Validate recur_day
  if (data.frequency === 'monthly') {
    const day = parseInt(data.recur_day);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.recur_day = 'Day must be between 1-31';
    }
  }

  // Validate category
  if (!data.category || typeof data.category !== 'string') {
    errors.category = 'Category is required';
  } else {
    sanitized.category = sanitizeString(data.category);
  }

  // Remove unexpected fields
  const allowedFields = ['description', 'amount', 'category', 'frequency', 'recur_day', 'next_run_date', 'is_active'];
  Object.keys(sanitized).forEach(key => {
    if (!allowedFields.includes(key)) {
      delete sanitized[key];
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};
