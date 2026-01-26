import React, { useState } from 'react';
import OfferCard from './OfferCard';
import fintelOffers from '../../../data/fintelOffers.json';
import './SaveMore.css';

const SaveMore = () => {
  const [activeCategory, setActiveCategory] = useState('savings');
  
  const offers = activeCategory === 'savings' 
    ? fintelOffers.savingsAccounts 
    : fintelOffers.creditCards;

  return (
    <div className="save-more-container">
      <header className="save-more-header">
        <h1>💰 Maximize Your Savings</h1>
        <p>Compare top-rated savings accounts and credit cards to reach your financial goals faster</p>
      </header>

      <div className="category-tabs">
        <button 
          className={activeCategory === 'savings' ? 'active' : ''}
          onClick={() => setActiveCategory('savings')}
        >
          💎 High-Interest Savings
        </button>
        <button 
          className={activeCategory === 'creditCards' ? 'active' : ''}
          onClick={() => setActiveCategory('creditCards')}
        >
          💳 Cashback Credit Cards
        </button>
      </div>

      <div className="offers-grid">
        {offers.map(offer => (
          <OfferCard 
            key={offer.id} 
            offer={offer} 
            type={activeCategory === 'savings' ? 'savings' : 'creditCard'}
          />
        ))}
      </div>

      <div className="disclaimer">
        <p>
          <strong>⚠️ Important:</strong> All rates and offers are subject to approval and may change. 
          Please review full terms on the provider's website. BudgetBuddy is an independent 
          comparison service and may be compensated by featured providers.
        </p>
      </div>
    </div>
  );
};

export default SaveMore;
