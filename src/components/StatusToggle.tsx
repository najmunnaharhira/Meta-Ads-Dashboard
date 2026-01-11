interface StatusToggleProps {
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
  disabled?: boolean;
  onChange: (newStatus: 'ACTIVE' | 'PAUSED') => void;
}

const StatusToggle = ({ status, disabled, onChange }: StatusToggleProps) => {
  const isActive = status === 'ACTIVE';

  const handleToggle = () => {
    if (disabled || status === 'ARCHIVED' || status === 'DELETED') return;
    onChange(isActive ? 'PAUSED' : 'ACTIVE');
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || status === 'ARCHIVED' || status === 'DELETED'}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">{isActive ? 'Active' : 'Paused'}</span>
    </button>
  );
};

export default StatusToggle;
