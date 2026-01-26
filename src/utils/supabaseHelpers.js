import { supabase } from '../supabaseClient';
import { validateTransaction, validateGoal, validateRecurringRule } from '../lib/validation';

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Converts Supabase errors into user-friendly messages
 */
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  
  const errorMessages = {
    'JWT expired': 'Your session has expired. Please log in again.',
    'Invalid JWT': 'Authentication error. Please log in again.',
    'Row level security': 'You do not have permission to perform this action.',
    'violates check constraint': 'Invalid data. Please check your input.',
    'Rate limit exceeded': 'You are doing this too quickly. Please wait a moment and try again.',
    'violates foreign key': 'This record is referenced by other data and cannot be deleted.',
    'duplicate key': 'This record already exists.',
    'violates not-null': 'Required fields are missing.',
  };
  
  for (const [key, message] of Object.entries(errorMessages)) {
    if (error.message?.includes(key) || error.toString().includes(key)) {
      return message;
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// ============================================
// AUDIT LOGS
// ============================================

/**
 * Fetch audit logs for current user
 * @param {string} userId - Current user ID
 * @param {number} limit - Max number of logs to fetch (default 50)
 * @param {string} tableFilter - Optional: filter by table name
 */
export const fetchAuditLogs = async (userId, limit = 50, tableFilter = null) => {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (tableFilter) {
      query = query.eq('table_name', tableFilter);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

// ============================================
// TRANSACTIONS
// ============================================

export const fetchTransactions = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const addTransaction = async (userId, transaction) => {
  try {
    // Validate and sanitize input
    const { isValid, errors, sanitized } = validateTransaction(transaction);
    
    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        ...sanitized
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const updateTransaction = async (transactionId, updates) => {
  try {
    // Validate and sanitize input
    const { isValid, errors, sanitized } = validateTransaction(updates);
    
    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(sanitized)
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (error) throw error;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

// ============================================
// RECURRING RULES
// ============================================

export const fetchRecurringRules = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('recurring_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const addRecurringRule = async (userId, rule) => {
  try {
    // Validate and sanitize input
    const { isValid, errors, sanitized } = validateRecurringRule(rule);
    
    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const { data, error } = await supabase
      .from('recurring_rules')
      .insert([{
        user_id: userId,
        ...sanitized
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const updateRecurringRule = async (ruleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('recurring_rules')
      .update(updates)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const deleteRecurringRule = async (ruleId) => {
  try {
    const { error } = await supabase
      .from('recurring_rules')
      .update({ is_active: false })
      .eq('id', ruleId);

    if (error) throw error;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

// Process due recurring transactions (with idempotency check)
export const processDueRecurringTransactions = async (userId) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch all active recurring rules that are due
    const { data: dueRules, error: fetchError } = await supabase
      .from('recurring_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_run_date', today);

    if (fetchError) throw fetchError;
    if (!dueRules || dueRules.length === 0) return [];

    const createdTransactions = [];

    for (const rule of dueRules) {
      // ✅ IDEMPOTENCY CHECK: Prevent duplicate transactions for the same rule + date
      const { data: existingTransaction } = await supabase
        .from('transactions')
        .select('id')
        .eq('recurring_rule_id', rule.id)
        .eq('date', today)
        .maybeSingle();

      // Skip if transaction already exists for this rule today
      if (existingTransaction) {
        console.log(`Transaction already exists for rule ${rule.id} on ${today}, skipping.`);
        continue;
      }

      // Create transaction
      const transaction = await addTransaction(userId, {
        date: today,
        description: rule.description,
        amount: rule.amount,
        category: rule.category,
        is_recurring: true,
        recurring_rule_id: rule.id
      });

      createdTransactions.push(transaction);

      // Calculate next run date
      const nextDate = calculateNextRunDate(rule.frequency, rule.recur_day, today);

      // Update recurring rule
      await updateRecurringRule(rule.id, {
        next_run_date: nextDate
      });
    }

    return createdTransactions;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

// Calculate next run date for recurring transactions
const calculateNextRunDate = (frequency, recurDay, currentDate) => {
  const current = new Date(currentDate);
  
  if (frequency === 'monthly') {
    // Next month, same day
    const next = new Date(current);
    next.setMonth(next.getMonth() + 1);
    next.setDate(parseInt(recurDay));
    return next.toISOString().split('T')[0];
  } else if (frequency === 'biweekly') {
    // 14 days from now
    const next = new Date(current);
    next.setDate(next.getDate() + 14);
    return next.toISOString().split('T')[0];
  }
  
  return currentDate;
};

// ============================================
// CATEGORIES
// ============================================

export const fetchCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const addCategory = async (userId, category) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        user_id: userId,
        ...category
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

// ============================================
// GOALS
// ============================================

export const fetchGoals = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const addGoal = async (goal, userId) => {
  try {
    // ✅ FIX: Validate BEFORE adding userId
    const goalForValidation = {
      name: goal.name,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount || 0,
      deadline: goal.deadline || null,
      category: goal.category || '🎯'
    };

    const { isValid, errors, sanitized } = validateGoal(goalForValidation);
    
    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ');
      console.error('Validation failed:', errors);
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    // ✅ Now insert with userId and additional fields
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        user_id: userId,
        ...sanitized,
        color: goal.color || '#10b981',
        created_at: goal.created_at || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase error:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const updateGoal = async (goalId, updates, userId) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', goalId)
      .eq('user_id', userId) // ✅ Security: ensure user owns this goal
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase error:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const deleteGoal = async (goalId, userId) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId); // ✅ Security: ensure user owns this goal

    if (error) throw error;
    return true; // ✅ Return success indicator
  } catch (error) {
    console.error('Supabase error:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};
