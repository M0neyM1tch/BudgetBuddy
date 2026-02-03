import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { addGoal as addGoalDB, updateGoal as updateGoalDB, deleteGoal as deleteGoalDB } from '../../../utils/supabaseHelpers';
import { addTransaction as addTransactionDB } from '../../../utils/supabaseHelpers';
import { validateGoal } from '../../../lib/validation';
import { trackFeature, trackError, getAmountRange } from '../../../utils/analytics';
import './Goals.css';
import GoalCard from './GoalCard';
import HealthScore from './HealthScore';

function Goals({ goals, setGoals, transactions }) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: 0,
    deadline: '',
    category: '🎯',
    color: '#10b981'
  });

  // Stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => (g.current_amount || 0) >= g.target_amount).length;
  const totalTargeted = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + (g.current_amount || 0), 0);
  const overallProgress = totalTargeted > 0 ? (totalSaved / totalTargeted) * 100 : 0;

  // === ADD GOAL ===
  async function handleAddGoal(e) {
    e.preventDefault();

    if (!formData.name || !formData.target_amount) {
      alert('Please fill in goal name and target amount');
      return;
    }

    const goalData = {
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0,
      deadline: formData.deadline || null,
      category: formData.category,
      color: formData.color || '#10b981'
    };

    if (user) {
      try {
        const addedGoal = await addGoalDB(goalData, user.id);

        // Create transaction for initial amount if > 0
        if (goalData.current_amount > 0) {
          try {
            await addTransactionDB(user.id, {
              date: new Date().toISOString().split('T')[0],
              description: `Initial contribution to ${goalData.name}`,
              amount: goalData.current_amount,
              category: `Goal: ${goalData.name}`,
              is_recurring: false
            });
            console.log('✅ Created initial transaction for goal');
          } catch (txError) {
            console.error('Error creating initial transaction:', txError);
            trackError('goal_initial_transaction_error', txError.message, txError.stack, user.id);
          }
        }

        setGoals([...goals, addedGoal]);
        
        // Track goal creation
        trackFeature(user.id, 'goals', 'create', {
          target_amount_range: getAmountRange(goalData.target_amount),
          category: goalData.category,
          has_deadline: !!goalData.deadline,
          initial_amount: goalData.current_amount > 0
        });
        
        console.log('📊 Goal creation tracked');
        resetForm();
      } catch (error) {
        console.error('Error adding goal:', error);
        
        // Track error
        trackError('goal_create_error', error.message, error.stack, user.id, {
          goal_category: formData.category
        });
        
        alert('Failed to add goal: ' + error.message);
      }
    } else {
      const tempGoal = { ...goalData, id: Date.now() };
      setGoals([...goals, tempGoal]);
      resetForm();
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: 0,
      deadline: '',
      category: '🎯',
      color: '#10b981'
    });
    setShowForm(false);
  }

  // === CONTRIBUTE TO GOAL ===
  async function handleContribute(goalId, amount) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newCurrentAmount = (goal.current_amount || 0) + amount;
    const wasComplete = (goal.current_amount || 0) >= goal.target_amount;
    const isNowComplete = newCurrentAmount >= goal.target_amount;

    if (user) {
      try {
        // Create transaction for contribution
        await addTransactionDB(user.id, {
          date: new Date().toISOString().split('T')[0],
          description: `Contribution to ${goal.name}`,
          amount: amount,
          category: `Goal: ${goal.name}`,
          is_recurring: false
        });

        console.log(`✅ Added $${amount} contribution to ${goal.name}`);

        // Update goal
        const updated = await updateGoalDB(goalId, {
          current_amount: newCurrentAmount
        }, user.id);

        if (updated) {
          setGoals(goals.map(g => g.id === goalId ? updated : g));
        }

        // Track contribution
        trackFeature(user.id, 'goals', 'contribute', {
          amount_range: getAmountRange(amount),
          goal_category: goal.category,
          progress_percent: Math.round((newCurrentAmount / goal.target_amount) * 100)
        });

        // Track completion if goal just became complete
        if (!wasComplete && isNowComplete) {
          trackFeature(user.id, 'goals', 'complete', {
            goal_category: goal.category,
            target_amount_range: getAmountRange(goal.target_amount),
            had_deadline: !!goal.deadline
          });
          console.log('🎉 Goal completion tracked!');
        }

      } catch (error) {
        console.error('Error contributing to goal:', error);
        
        trackError('goal_contribute_error', error.message, error.stack, user.id, {
          goal_id: goalId
        });
        
        alert('Failed to contribute: ' + error.message);
      }
    } else {
      setGoals(goals.map(g => g.id === goalId ? { ...g, current_amount: newCurrentAmount } : g));
    }
  }

  // === DELETE GOAL ===
  async function handleDeleteGoal(goalId) {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    const goal = goals.find(g => g.id === goalId);
    const wasCompleted = goal ? (goal.current_amount || 0) >= goal.target_amount : false;

    if (user) {
      try {
        await deleteGoalDB(goalId, user.id);
        setGoals(goals.filter(g => g.id !== goalId));
        
        // Track deletion
        trackFeature(user.id, 'goals', 'delete', {
          was_completed: wasCompleted,
          goal_category: goal?.category,
          progress_percent: goal ? Math.round(((goal.current_amount || 0) / goal.target_amount) * 100) : 0
        });
        
        console.log('📊 Goal deletion tracked');
      } catch (error) {
        console.error('Error deleting goal:', error);
        
        trackError('goal_delete_error', error.message, error.stack, user.id, {
          goal_id: goalId
        });
        
        alert('Failed to delete goal: ' + error.message);
      }
    } else {
      setGoals(goals.filter(g => g.id !== goalId));
    }
  }

  return (
    <div className="goals-container-new">
      {/* Hero Section */}
      <div className="goals-hero">
        <div className="goals-hero-content">
          <h1>🎯 My Goals</h1>
          <p className="goals-hero-subtitle">Track progress and achieve your dreams</p>

          {/* Stats Grid */}
          {goals.length > 0 && (
            <div className="goals-stats-grid">
              <div className="goal-stat-card">
                <span className="stat-icon">🎯</span>
                <div className="stat-content">
                  <div className="stat-value">{totalGoals}</div>
                  <div className="stat-label">TOTAL GOALS</div>
                </div>
              </div>

              <div className="goal-stat-card">
                <span className="stat-icon">✅</span>
                <div className="stat-content">
                  <div className="stat-value">{completedGoals}</div>
                  <div className="stat-label">COMPLETED</div>
                </div>
              </div>

              <div className="goal-stat-card">
                <span className="stat-icon">💰</span>
                <div className="stat-content">
                  <div className="stat-value">${Math.round(totalSaved)}</div>
                  <div className="stat-label">TOTAL SAVED</div>
                </div>
              </div>

              <div className="goal-stat-card">
                <span className="stat-icon">📊</span>
                <div className="stat-content">
                  <div className="stat-value">{overallProgress.toFixed(0)}%</div>
                  <div className="stat-label">OVERALL PROGRESS</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Goals Section */}
      <div className="goals-section-new">
        {/* Header with Add Button */}
        <div className="goals-header">
          <h2></h2>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '✖ Cancel' : '+ New Goal'}
          </button>
        </div>

        {/* Goal Form */}
        {showForm && (
          <div className="goal-form-card">
            <h3>Create New Goal</h3>
            <form onSubmit={handleAddGoal}>
              <div className="form-row">
                <div className="form-group">
                  <label>Goal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Emergency Fund"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Target Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Current Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Deadline (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="🎯">🎯 General</option>
                    <option value="🏠">🏠 Home</option>
                    <option value="🚗">🚗 Vehicle</option>
                    <option value="✈️">✈️ Travel</option>
                    <option value="🎓">🎓 Education</option>
                    <option value="💰">💰 Investment</option>
                    <option value="🏥">🏥 Emergency</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Color Theme</label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-full">
                Create Goal
              </button>
            </form>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="goals-grid">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAddToGoal={handleContribute}
                onDeleteGoal={handleDeleteGoal}
              />
            ))}
          </div>
        ) : (
          <div className="no-goals">
            <div className="no-goals-icon">🎯</div>
            <h3>No goals yet</h3>
            <p>Create your first goal to start tracking your progress!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
