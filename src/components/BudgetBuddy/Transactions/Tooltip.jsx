import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

function Tooltip({ content, children }) {
  const [isVisible, setIsVisible] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible]);

  // Prevent body scroll when tooltip is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const tooltipContent = isVisible ? (
    <>
      <div className="tooltip-backdrop" onClick={() => setIsVisible(false)} />
      <div className="tooltip-content-centered">
        <button className="tooltip-close" onClick={() => setIsVisible(false)}>✕</button>
        <div className="tooltip-scroll">
          {content}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <span 
        className="tooltip-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
      >
        {children}
      </span>
      {/* Render tooltip at document.body level to escape all containers */}
      {tooltipContent && createPortal(tooltipContent, document.body)}
    </>
  );
}

export default Tooltip;
