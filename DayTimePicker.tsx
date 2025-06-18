import React from 'react';
import { TIME_SLOTS } from '../constants';
import type { TimeOption } from '../types';

interface DayTimePickerProps {
  selectedDay: string; // ISO Date string "YYYY-MM-DD"
  setSelectedDay: (day: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const TimeSelectField: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}> = ({ id, label, value, onChange, options, className }) => (
  <div className={`flex-grow ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <select
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full py-3 px-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-700 text-slate-100">
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const DateInputField: React.FC<{
  id: string;
  label: string;
  value: string; // ISO Date string "YYYY-MM-DD"
  onChange: (value: string) => void;
  className?: string;
}> = ({ id, label, value, onChange, className }) => (
  <div className={`flex-grow ${className}`}>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <input
      type="date"
      id={id}
      name={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full py-2.5 px-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out appearance-none"
      // You might need to add min={getTodayISODate()} if you want to restrict to today or future
    />
  </div>
);


export const DayTimePicker: React.FC<DayTimePickerProps> = ({
  selectedDay,
  setSelectedDay,
  selectedTime,
  setSelectedTime,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 flex-grow">
      <DateInputField
        id="day-select"
        label="Select Date"
        value={selectedDay} // Expects "YYYY-MM-DD"
        onChange={setSelectedDay}
        className="sm:w-1/2"
      />
      <TimeSelectField
        id="time-select"
        label="Select Time"
        value={selectedTime}
        onChange={setSelectedTime}
        options={TIME_SLOTS}
        className="sm:w-1/2"
      />
    </div>
  );
};