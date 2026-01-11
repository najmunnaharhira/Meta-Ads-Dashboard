import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Campaign } from '../types';
import { getAdPreview } from '../services/facebookApi';

interface AdPreviewModalProps {
  campaign: Campaign;
  onClose: () => void;
}

const AdPreviewModal = ({ campaign, onClose }: AdPreviewModalProps) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adFormat, setAdFormat] = useState<'DESKTOP_FEED_STANDARD' | 'MOBILE_FEED_STANDARD'>('DESKTOP_FEED_STANDARD');

  useEffect(() => {
    loadPreview();
  }, [campaign.creative_id, adFormat]);

  const loadPreview = async () => {
    if (!campaign.creative_id) {
      setError('No creative ID available for this campaign');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const html = await getAdPreview(campaign.creative_id, adFormat);
      setPreviewHtml(html);
    } catch (err: any) {
      setError(err.message || 'Failed to load ad preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Ad Preview - {campaign.name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              See how your ad appears on Facebook
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">View as:</span>
            <button
              onClick={() => setAdFormat('DESKTOP_FEED_STANDARD')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                adFormat === 'DESKTOP_FEED_STANDARD'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setAdFormat('MOBILE_FEED_STANDARD')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                adFormat === 'MOBILE_FEED_STANDARD'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Mobile
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading preview...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-full max-w-md"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdPreviewModal;
