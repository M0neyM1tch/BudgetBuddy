import React, { useState } from 'react';
import './EngagingSlider.css';

function EngagingSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  largeStep, // Custom large step increment
  onChange, 
  icon,
  unit = '',
  prefix = '',
  color = '#10b981',
  showMarkers = false,
  showInput = true
}) {
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const percentage = ((value - min) / (max - min)) * 100;

  

  // Use custom largeStep if provided, otherwise fallback to 5% of range
  const effectiveLargeStep = largeStep || (max - min) / 20;

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleDirectInput = (e) => {
    const newValue = parseFloat(e.target.value.replace(/,/g, ''));
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number' && val >= 1000) {
      return val.toLocaleString();
    }
    return val;
  };

  // Fine-tune with arrow keys
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(max, value + (e.shiftKey ? effectiveLargeStep : step)));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(min, value - (e.shiftKey ? effectiveLargeStep : step)));
    }
  };

  return (
    <div className="engaging-slider">
      <div className="slider-header">
        {icon && <span className="slider-icon">{icon}</span>}
        <span className="slider-label">{label}</span>
        
        {showInput ? (
          <div className="value-input-container">
            <span className="value-prefix">{prefix}</span>
            <input
              type="text"
              value={formatValue(value)}
              onChange={handleDirectInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`slider-value-input ${isFocused ? 'focused' : ''}`}
              style={{ color }}
            />
            <span className="value-suffix">{unit}</span>
          </div>
        ) : (
          <span className="slider-value" style={{ color }}>
            {prefix}{formatValue(value)}{unit}
          </span>
        )}
      </div>
      
      <div className="slider-track-container-wide">
        <div className="slider-track-wide">
          <div 
            className="slider-fill-wide" 
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, ${color}ee, ${color})`,
              boxShadow: `0 0 ${isActive ? 12 : 6}px ${color}66`
            }}
          />
          
          {/* Grid lines for precision */}
          <div className="slider-grid">
            {[...Array(11)].map((_, i) => (
              <div 
                key={i} 
                className="grid-line" 
                style={{ left: `${i * 10}%` }}
              />
            ))}
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            onKeyDown={handleKeyDown}
            onMouseDown={() => setIsActive(true)}
            onMouseUp={() => setIsActive(false)}
            onTouchStart={() => setIsActive(true)}
            onTouchEnd={() => setIsActive(false)}
            className="slider-input-wide"
          />
          
          <div 
            className={`slider-thumb-wide ${isActive ? 'active' : ''}`}
            style={{ 
              left: `${percentage}%`,
              background: color,
              boxShadow: isActive 
                ? `0 4px 16px ${color}aa, 0 0 0 6px ${color}22`
                : `0 2px 8px ${color}88, 0 0 0 3px ${color}33`
            }}
          >
            {isActive && (
              <span className="thumb-value-wide">
                {prefix}{formatValue(value)}{unit}
              </span>
            )}
          </div>
        </div>
        
        {showMarkers && (
          <div className="slider-markers-wide">
            <span>{prefix}{formatValue(min)}{unit}</span>
            <span>{prefix}{formatValue(Math.floor((min + max) / 2))}{unit}</span>
            <span>{prefix}{formatValue(max)}{unit}</span>
          </div>
        )}

        {/* Fine-tune controls */}
        <div className="fine-tune-controls">
          <button 
            className="fine-tune-btn decrease"
            onClick={() => onChange(Math.max(min, value - step))}
            onMouseDown={(e) => e.preventDefault()}
          >
            −
          </button>
          <span className="fine-tune-label">
            Fine Tune (Shift + Arrow Keys: {prefix}{formatValue(effectiveLargeStep)}{unit} jumps)
          </span>
          <button 
            className="fine-tune-btn increase"
            onClick={() => onChange(Math.min(max, value + step))}
            onMouseDown={(e) => e.preventDefault()}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default EngagingSlider;
