import { supabase } from '../supabaseClient';
import { validateTransaction, validateGoal, validateRecurringRule } from '../lib/validation';

// ============================================
// ERROR HANDLING
// ============================================

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

export const updateTransaction = async (transactionId, updates, userId) => {
  try {
    // ✅ Partial validation - only validate fields being updated
    const sanitized = {};
    
    if (updates.description !== undefined) {
      if (typeof updates.description !== 'string' || updates.description.trim().length === 0) {
        throw new Error('Description cannot be empty');
      }
      if (updates.description.length > 200) {
        throw new Error('Description must be less than 200 characters');
      }
      sanitized.description = updates.description.trim();
    }
    
    if (updates.amount !== undefined) {
      const numAmount = parseFloat(updates.amount);
      if (isNaN(numAmount) || numAmount === 0) {
        throw new Error('Amount must be a valid non-zero number');
      }
      if (Math.abs(numAmount) > 10000000) {
        throw new Error('Amount exceeds maximum ($10M)');
      }
      sanitized.amount = numAmount;
    }
    
    if (updates.date !== undefined) {
      const dateObj = new Date(updates.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date format');
      }
      sanitized.date = updates.date;
    }
    
    if (updates.category !== undefined) {
      if (typeof updates.category !== 'string' || updates.category.length > 50) {
        throw new Error('Invalid category');
      }
      sanitized.category = updates.category.trim();
    }
    
    if (updates.is_recurring !== undefined) {
      sanitized.is_recurring = Boolean(updates.is_recurring);
    }
    
    if (updates.recurring_rule_id !== undefined) {
      sanitized.recurring_rule_id = updates.recurring_rule_id;
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(sanitized)
      .eq('id', transactionId)
      .eq('user_id', userId)  // ✅ Security
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const deleteTransaction = async (transactionId, userId) => {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', userId);  // ✅ Security

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
    console.log('🔍 DEBUG - Input rule:', rule);
    
    const { isValid, errors, sanitized } = validateRecurringRule(rule);
    
    console.log('🔍 DEBUG - Validation result:', { isValid, errors, sanitized });
    
    if (!isValid) {
      const errorMessage = Object.values(errors).join(', ');
      console.error('❌ Validation errors:', errors);
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const dataToInsert = {
      user_id: userId,
      description: sanitized.description,
      amount: sanitized.amount,
      category: sanitized.category,
      frequency: sanitized.frequency,
      recur_day: sanitized.recur_day,
      next_run_date: sanitized.next_run_date,
      is_active: true
    };
    
    console.log('🔍 DEBUG - Data being inserted:', dataToInsert);

    const { data, error } = await supabase
      .from('recurring_rules')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error details:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Error details:', error.details);
      throw error;
    }
    
    console.log('✅ Successfully inserted:', data);
    return data;
  } catch (error) {
    console.error('❌ Full error:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const updateRecurringRule = async (ruleId, updates, userId = null) => {
  try {
    let query = supabase
      .from('recurring_rules')
      .update(updates)
      .eq('id', ruleId);
    
    // ✅ Add user_id check if provided (for manual updates)
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const deleteRecurringRule = async (ruleId, userId) => {
  try {
    const { error } = await supabase
      .from('recurring_rules')
      .update({ is_active: false })
      .eq('id', ruleId)
      .eq('user_id', userId);  // ✅ Security

    if (error) throw error;
  } catch (error) {
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

export const processDueRecurringTransactions = async (userId) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];

    console.log('🔄 Processing recurring transactions for date:', todayString);

    const { data: dueRules, error: fetchError } = await supabase
      .from('recurring_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_run_date', todayString);

    if (fetchError) throw fetchError;
    
    if (!dueRules || dueRules.length === 0) {
      console.log('✓ No due recurring transactions found');
      return [];
    }

    console.log(`📋 Found ${dueRules.length} due recurring rule(s)`);

    const createdTransactions = [];
    const errors = [];

    for (const rule of dueRules) {
      try {
        const { data: existingTransaction } = await supabase
          .from('transactions')
          .select('id')
          .eq('recurring_rule_id', rule.id)
          .eq('date', rule.next_run_date)
          .maybeSingle();

        if (existingTransaction) {
          console.log(`⏭️  Transaction already exists for "${rule.description}" on ${rule.next_run_date}`);
          
          const nextDate = calculateNextRunDate(rule);
          if (nextDate !== rule.next_run_date) {
            await updateRecurringRule(rule.id, { next_run_date: nextDate });
            console.log(`📅 Updated next run date to ${nextDate}`);
          }
          continue;
        }

        const transaction = await addTransaction(userId, {
          date: rule.next_run_date,
          description: rule.description,
          amount: rule.amount,
          category: rule.category,
          is_recurring: true,
          recurring_rule_id: rule.id
        });

        createdTransactions.push(transaction);
        console.log(`✅ Created recurring transaction: "${rule.description}" for ${rule.next_run_date}`);

        const nextDate = calculateNextRunDate(rule);

        await updateRecurringRule(rule.id, { next_run_date: nextDate });

        console.log(`📅 Next occurrence for "${rule.description}": ${nextDate}`);
        
      } catch (ruleError) {
        console.error(`❌ Error processing rule "${rule.description}":`, ruleError);
        errors.push({
          rule: rule.description,
          error: ruleError.message
        });
      }
    }

    if (errors.length > 0) {
      console.warn('⚠️ Some recurring transactions failed:', errors);
    }

    if (createdTransactions.length > 0) {
      console.log(`✅ Successfully created ${createdTransactions.length} recurring transaction(s)`);
    }

    return createdTransactions;
    
  } catch (error) {
    console.error('❌ Error processing recurring transactions:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};

const calculateNextRunDate = (rule) => {
  const currentDate = new Date(rule.next_run_date + 'T00:00:00.000Z');
  
  if (rule.frequency === 'monthly') {
    const nextDate = new Date(currentDate);
    nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
    
    if (rule.recur_day) {
      const targetDay = parseInt(rule.recur_day);
      const lastDayOfMonth = new Date(
        Date.UTC(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0)
      ).getUTCDate();
      const clampedDay = Math.min(targetDay, lastDayOfMonth);
      nextDate.setUTCDate(clampedDay);
    }
    
    return nextDate.toISOString().split('T')[0];
    
  } else if (rule.frequency === 'biweekly') {
    const nextDate = new Date(currentDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 14);
    return nextDate.toISOString().split('T')[0];
    
  } else if (rule.frequency === 'weekly') {
    const nextDate = new Date(currentDate);
    nextDate.setUTCDate(nextDate.getUTCDate() + 7);
    return nextDate.toISOString().split('T')[0];
  }
  
  console.warn('⚠️ Unknown frequency:', rule.frequency);
  return rule.next_run_date;
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
      .eq('user_id', userId)
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
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Supabase error:', error);
    const userMessage = handleSupabaseError(error);
    throw new Error(userMessage);
  }
};
