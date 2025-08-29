'use client';

import { useState } from 'react';

interface ClaimFormProps {
  onSubmit: (data: { claim?: string; url?: string }) => void;
  isLoading: boolean;
}

export default function ClaimForm({ onSubmit, isLoading }: ClaimFormProps) {
  const [activeTab, setActiveTab] = useState<'claim' | 'url'>('claim');
  const [claim, setClaim] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (activeTab === 'claim' && claim.trim()) {
      onSubmit({ claim: claim.trim() });
    } else if (activeTab === 'url' && url.trim()) {
      onSubmit({ url: url.trim() });
    }
  };

  const isValid = activeTab === 'claim' ? claim.trim() : url.trim();

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab('claim')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                activeTab === 'claim'
                  ? 'text-indigo-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Text Claim
              </div>
              {activeTab === 'claim' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition-all duration-200 relative ${
                activeTab === 'url'
                  ? 'text-indigo-600 bg-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Article Link
              </div>
              {activeTab === 'url' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              )}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8">
          {activeTab === 'claim' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Enter your claim or statement to fact-check
                </label>
                <div className="relative">
                  <textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder="e.g., 'Vaccines cause autism' or 'The pyramids were built by aliens' or paste any news headline..."
                    className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    rows={5}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {claim.length}/5000
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Paste the URL of the article you want to fact-check
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/news-article"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-gray-900 placeholder-gray-400"
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                !isValid || isLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing {activeTab === 'url' ? 'Article' : 'Claim'}...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Fact Check
                </div>
              )}
            </button>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-semibold text-blue-900">AI-Powered</h3>
              </div>
              <p className="text-sm text-blue-700">Uses advanced AI to verify claims against reliable sources</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="font-semibold text-green-900">PDF Reports</h3>
              </div>
              <p className="text-sm text-green-700">Download detailed fact-check reports with sources</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}