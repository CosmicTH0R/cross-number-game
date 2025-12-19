// src/components/Cell.jsx
import React from 'react';

const Cell = ({ data, onChange, value, isCorrect, isChecked }) => {
  // 1. Black Block (Spacer)
  if (data.type === 'block') {
    return <div className="w-12 h-12 bg-gray-800 rounded-md"></div>;
  }

  // 2. Static Clue (e.g., "+", "=", "5")
  if (data.type === 'static') {
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-900 font-bold text-xl rounded-md shadow-sm border border-blue-200">
        {data.display}
      </div>
    );
  }

  // 3. User Input
  // Determine border color based on validation state
  let borderColor = "border-gray-300";
  if (isChecked) {
    borderColor = isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50";
  }

  return (
    <input
      type="text"
      maxLength="1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors ${borderColor}`}
    />
  );
};

export default Cell;