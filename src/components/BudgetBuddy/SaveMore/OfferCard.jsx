import React from 'react';
import './SaveMore.css';

const OfferCard = ({ offer, type = 'savings' }) => {
  const handleClick = () => {
    console.log(`User clicked offer: ${offer.id}`);
    window.open(offer.fintelLink, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`offer-card ${offer.featured ? 'featured' : ''}`}>
      <div className="offer-header">
        <h3>{offer.provider}</h3>
        {offer.featured && <span className="badge">⭐ Featured</span>}
      </div>
      
      <h4>{offer.productName}</h4>
      
      <div className="offer-details">
        {type === 'savings' && (
          <>
            <p className="rate">{offer.rate} <span>interest rate</span></p>
            {offer.bonus && <p className="bonus">🎁 {offer.bonus}</p>}
          </>
        )}
        
        {type === 'creditCard' && (
          <>
            <p className="cashback">💳 {offer.cashback}</p>
            {offer.bonus && <p className="bonus">🎁 {offer.bonus}</p>}
          </>
        )}
        
        <p className="description">{offer.description}</p>
      </div>
      
      <button 
        onClick={handleClick}
        className="cta-button"
      >
        Learn More & Apply →
      </button>
      
      <p className="disclosure">
        Rates as of {new Date(offer.lastUpdated).toLocaleDateString()}. 
        BudgetBuddy may earn a commission if you open an account.
      </p>
    </div>
  );
};

export default OfferCard;
