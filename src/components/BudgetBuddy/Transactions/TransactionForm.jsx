import React from 'react';

function TransactionForm({ formData, setFormData, onSubmit, goals = [], categories = [] }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        required
      />

      <input
        type="text"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
        required
      />

      <input
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        placeholder="Amount"
        required
      />

      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <button type="submit">Add Transaction</button>
    </form>
  );
}

export default TransactionForm;
