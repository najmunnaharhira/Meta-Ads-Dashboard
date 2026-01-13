import { useState } from 'react';
import { X } from 'lucide-react';
import { Campaign } from '../types';
import { updateCampaignBudget } from '../services/facebookApi';

interface BudgetEditModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSave: () => void;
  onError?: (error: string) => void;
}

const BudgetEditModal = ({ campaign, onClose, onSave, onError }: BudgetEditModalProps) => {
  const [budget, setBudget] = useState<string>(
    campaign.daily_budget?.toString() || campaign.lifetime_budget?.toString() || '0'
  );
  const [isDaily, setIsDaily] = useState(!!campaign.daily_budget);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const budgetValue = parseFloat(budget);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      const msg = 'Please enter a valid budget amount';
      setError(msg);
      onError?.(msg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isDaily) {
        await updateCampaignBudget(campaign.id, budgetValue);
      } else {
        const msg =
          'Lifetime budget updates are not supported in this version. Please use daily budget.';
        setError(msg);
        onError?.(msg);
        setLoading(false);
        return;
      }

      onSave();
      onClose();
      // Success notification will be shown by parent component
    } catch (err: any) {
      const msg = err?.message || 'Failed to update budget';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Budget</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign: {campaign.name}
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isDaily}
                  onChange={() => setIsDaily(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Daily Budget</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isDaily}
                  onChange={() => setIsDaily(false)}
                  className="mr-2"
                  disabled
                />
                <span className="text-sm text-gray-500">Lifetime Budget (Not supported)</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Note: Facebook uses cents internally. Amount will be converted automatically.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetEditModal;