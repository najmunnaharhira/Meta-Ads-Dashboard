import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Campaign, AdAccount, DatePreset } from '../types';
import { getAdAccounts, getCampaigns } from '../services/facebookApi';
import { format } from 'date-fns';
import CampaignTable from './CampaignTable';
import DateFilter from './DateFilter';
import AdPreviewModal from './AdPreviewModal';
import BudgetEditModal from './BudgetEditModal';
import { useNotification } from '../hooks/useNotification';

const Dashboard = () => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [editBudgetCampaign, setEditBudgetCampaign] = useState<Campaign | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { showNotification, NotificationComponent } = useNotification();

  const loadAdAccounts = useCallback(async () => {
    try {
      setError(null);
      const accounts = await getAdAccounts();
      setAdAccounts(accounts);
      if (accounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accounts[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load ad accounts');
    }
  }, [selectedAccountId]);

  const loadCampaigns = useCallback(async () => {
    if (!selectedAccountId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaigns(selectedAccountId, datePreset);
      setCampaigns(data);
      setLastRefresh(new Date());
      showNotification('Campaigns loaded successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load campaigns';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, datePreset, showNotification]);

  useEffect(() => {
    loadAdAccounts();
  }, [loadAdAccounts]);

  useEffect(() => {
    if (selectedAccountId) {
      loadCampaigns();
    }
  }, [selectedAccountId, datePreset, loadCampaigns]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!selectedAccountId) return;
    
    const interval = setInterval(() => {
      loadCampaigns();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [selectedAccountId, loadCampaigns]);

  const handleRefresh = () => {
    loadCampaigns();
  };

  const handleDatePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
  };

  const handleCampaignUpdate = () => {
    // Refresh campaigns after update
    loadCampaigns();
    showNotification('Campaign updated successfully', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Facebook Ads Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Ad Account Selector */}
              {adAccounts.length > 0 && (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {adAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name || account.account_id}
                    </option>
                  ))}
                </select>
              )}
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {/* Last Refresh Time */}
          <div className="mt-2 text-sm text-gray-500">
            Last refreshed: {format(lastRefresh, 'PPpp')}
            {datePreset !== 'today' && (
              <span className="ml-2 text-amber-600">
                Note: Data may have a 15-20 minute delay
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Date Filter */}
        <div className="mb-6">
          <DateFilter
            selectedPreset={datePreset}
            onPresetChange={handleDatePresetChange}
          />
        </div>

        {/* Campaign Table */}
        {loading && campaigns.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No campaigns found for the selected date range.</p>
          </div>
        ) : (
          <CampaignTable
            campaigns={campaigns}
            onStatusToggle={handleCampaignUpdate}
            onBudgetEdit={(campaign) => setEditBudgetCampaign(campaign)}
            onPreview={(campaign) => setPreviewCampaign(campaign)}
            onError={(error) => showNotification(error, 'error')}
          />
        )}
      </main>

      {/* Ad Preview Modal */}
      {previewCampaign && (
        <AdPreviewModal
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      )}

      {/* Budget Edit Modal */}
      {editBudgetCampaign && (
        <BudgetEditModal
          campaign={editBudgetCampaign}
          onClose={() => setEditBudgetCampaign(null)}
          onSave={handleCampaignUpdate}
          onError={(error) => showNotification(error, 'error')}
        />
      )}

      {/* Notification */}
      {NotificationComponent}
    </div>
  );
};

export default Dashboard;
