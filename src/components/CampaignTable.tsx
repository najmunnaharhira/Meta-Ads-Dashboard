import { useState } from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { Campaign } from '../types';
import { updateCampaignStatus } from '../services/facebookApi';
import StatusToggle from './StatusToggle';

interface CampaignTableProps {
  campaigns: Campaign[];
  onStatusToggle: () => void;
  onBudgetEdit: (campaign: Campaign) => void;
  onPreview: (campaign: Campaign) => void;
  onError?: (error: string) => void;
}

const CampaignTable = ({
  campaigns,
  onStatusToggle,
  onBudgetEdit,
  onPreview,
  onError,
}: CampaignTableProps) => {
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusChange = async (campaignId: string, newStatus: 'ACTIVE' | 'PAUSED') => {
    setUpdatingStatus(campaignId);
    try {
      await updateCampaignStatus(campaignId, newStatus);
      onStatusToggle();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update campaign status';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num?: number) => {
    if (num === undefined || num === null) return '0%';
    return `${num.toFixed(2)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Impressions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusToggle
                    status={campaign.status}
                    disabled={updatingStatus === campaign.id}
                    onChange={(newStatus) => handleStatusChange(campaign.id, newStatus)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    campaign.delivery_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : campaign.delivery_status === 'PAUSED'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.delivery_status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-900">
                      {campaign.daily_budget 
                        ? formatCurrency(campaign.daily_budget) + '/day'
                        : campaign.lifetime_budget
                        ? formatCurrency(campaign.lifetime_budget) + ' (lifetime)'
                        : 'N/A'}
                    </span>
                    <button
                      onClick={() => onBudgetEdit(campaign)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(campaign.insights?.spend)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(campaign.insights?.impressions)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatNumber(campaign.insights?.clicks)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatPercentage(campaign.insights?.ctr)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(campaign.insights?.cpc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {campaign.creative_id && (
                    <button
                      onClick={() => onPreview(campaign)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      title="Preview Ad"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignTable;
