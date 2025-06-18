
import React from 'react';

interface ChipOption {
  value: string;
  label: string;
}

interface MultiSelectChipGroupProps {
  label: string;
  options: ChipOption[];
  selectedValues: string[];
  onChange: (newSelectedValues: string[]) => void;
  note?: string;
}

export const MultiSelectChipGroup: React.FC<MultiSelectChipGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  note
}) => {
  const handleToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onChange(newSelection);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button
            key={option.value}
            onClick={() => handleToggle(option.value)}
            type="button"
            aria-pressed={selectedValues.includes(option.value)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
              ${selectedValues.includes(option.value)
                ? 'bg-teal-500 text-white shadow-md focus:ring-teal-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-slate-100 focus:ring-teal-500'}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {note && <p className="text-xs text-slate-500 mt-2">{note}</p>}
    </div>
  );
};