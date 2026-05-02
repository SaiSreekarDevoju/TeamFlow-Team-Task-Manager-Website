import React, { useState } from 'react';

const Tooltip = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && content && (
        <div className={`absolute z-50 whitespace-nowrap px-2 py-1 bg-slate-900 text-white text-xs rounded shadow-lg pointer-events-none transition-opacity ${positions[position]}`}>
          {content}
          <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 
            -z-10
            top-[calc(100%-4px)] left-1/2 -translate-x-1/2
          "></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
