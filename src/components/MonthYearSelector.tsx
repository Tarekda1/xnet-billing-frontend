const MonthYearSelector = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <div>
    <select
      id="monthYear"
      value={value}
      onChange={onChange}
      className="w-full sm:w-48 mt-1 block py-1 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    >
      <option value="">All</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);
export default MonthYearSelector;
