import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showLabel = false,
  labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional']
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const currentVal = hoverValue || value;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= currentVal;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onClick={() => onChange && onChange(star)}
              onMouseEnter={() => !readOnly && setHoverValue(star)}
              onMouseLeave={() => !readOnly && setHoverValue(0)}
              className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95 transition-transform'} focus:outline-none`}
              aria-label={`${star} star`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  filled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 fill-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>
      {showLabel && currentVal > 0 && (
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
          {labels[currentVal - 1]}
        </span>
      )}
    </div>
  );
}
