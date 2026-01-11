import { DatePreset } from '../types';

interface DateFilterProps {
  selectedPreset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
}

const DateFilter = ({ selectedPreset, onPresetChange }: DateFilterProps) => {
  const presets: { value: DatePreset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7d', label: 'Last 7 Days' },
    { value: 'this_month', label: 'This Month' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Date Range:</span>
        <div className="flex space-x-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onPresetChange(preset.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPreset === preset.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
