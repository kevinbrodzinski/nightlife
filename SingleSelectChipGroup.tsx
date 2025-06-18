
import React from 'react';

interface ChipOption {
  value: string;
  label: string;
}

interface SingleSelectChipGroupProps {
  label: string;
  options: ChipOption[];
  selectedValue: string;
  onChange: (newSelectedValue: string) => void;
  note?: string;
  disabled?: boolean; // Added disabled prop
}

export const SingleSelectChipGroup: React.FC<SingleSelectChipGroupProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  note,
  disabled = false, // Default to false
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)} // Prevent onChange if disabled
            type="button"
            aria-pressed={selectedValue === option.value}
            disabled={disabled} // Apply disabled attribute
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
              ${disabled
                ? 'bg-slate-600 text-slate-500 cursor-not-allowed' // Disabled styles
                : selectedValue === option.value
                  ? 'bg-teal-500 text-white shadow-md focus:ring-teal-400'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100 focus:ring-teal-500'
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {note && <p className={`text-xs mt-2 ${disabled ? 'text-slate-600' : 'text-slate-500'}`}>{note}</p>}
    </div>
  );
};
