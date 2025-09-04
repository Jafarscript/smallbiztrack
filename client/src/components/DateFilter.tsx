// components/DateFilter.tsx
import React from "react";

type Props = {
  value: string;
  onChange: (val: string) => void;
};

const DateFilter: React.FC<Props> = ({ value, onChange }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="p-2 border rounded-lg"
    >
      <option value="daily">Daily</option>
      <option value="weekly">Weekly</option>
      <option value="monthly">Monthly</option>
      <option value="yearly">Yearly</option>
      <option value="all-time">All Time</option>
    </select>
  );
};

export default DateFilter;
