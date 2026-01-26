import React, { useState } from 'react';

function TransactionList({ transactions, onDelete, onUpdateCategory, onUpdateTransaction, categories, goals = [] }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // ✅ Start editing a transaction
  const handleStartEdit = (tx) => {
    setEditingId(tx.id);
    setEditForm({
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      category: tx.category
    });
  };

  // ✅ Save edited transaction
  const handleSaveEdit = async (id) => {
    try {
      if (onUpdateTransaction) {
        await onUpdateTransaction(id, editForm);
      }
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction: ' + error.message);
    }
  };

  // ✅ Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Sort handling
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Row class for color coding
  const getRowClass = (category) => {
    if (category === 'Income') return 'transaction-row income-row';
    if (category === 'Savings') return 'transaction-row savings-row';
    if (category.startsWith('Goal:')) return 'transaction-row goal-row';
    return 'transaction-row expense-row';
  };

  // Category badge
  const getCategoryBadge = (category) => {
    if (category === 'Income') {
      return <span className="category-badge income-badge">💰 {category}</span>;
    }
    if (category === 'Savings') {
      return <span className="category-badge savings-badge">💎 {category}</span>;
    }
    if (category.startsWith('Goal:')) {
      return <span className="category-badge goal-badge">🎯 {category.replace('Goal: ', '')}</span>;
    }
    return <span className="category-badge expense-badge">💸 {category}</span>;
  };

  // Sort transactions
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    }
    return 0;
  });

  if (sortedTransactions.length === 0) {
    return <p className="no-transactions">No transactions yet</p>;
  }

  return (
    <div className="transaction-list">
      {/* ✨ Mobile-friendly wrapper for horizontal scrolling */}
      <div className="transaction-table-wrapper">
        <table className="transaction-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Description</th>
              <th className="sortable" onClick={() => handleSort('amount')}>
                Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => (
              <tr key={tx.id} className={getRowClass(tx.category)}>
                {editingId === tx.id ? (
                  // ✅ EDIT MODE
                  <>
                    <td>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                        className="edit-input"
                      />
                    </td>
                    <td>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="edit-input"
                      >
                        <option value="Income">Income</option>
                        <option value="Savings">Savings</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        {goals.map(g => (
                          <option key={g.id} value={`Goal: ${g.name}`}>Goal: {g.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleSaveEdit(tx.id)} className="save-btn">
                        ✅ Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        ❌ Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  // ✅ VIEW MODE
                  <>
                    <td>{tx.date}</td>
                    <td>{tx.description}</td>
                    <td>
                      <span className={`amount amount-${tx.category === 'Income' ? 'income' : tx.category === 'Savings' || tx.category.startsWith('Goal:') ? 'savings' : 'expense'}`}>
                        ${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {getCategoryBadge(tx.category)}
                      {tx.is_recurring && <span className="recurring-icon"> 🔄</span>}
                    </td>
                    <td>
                      <button onClick={() => handleStartEdit(tx)} className="edit-btn">
                        ✏️ Edit
                      </button>
                      <button onClick={() => onDelete(tx.id)} className="delete-btn">
                        🗑️ Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TransactionList;
