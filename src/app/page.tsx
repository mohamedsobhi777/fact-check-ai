'use client';

import { useState } from 'react';
import ClaimForm from '@/components/ClaimForm';
import FactCheckResult from '@/components/FactCheckResult';
import axios from 'axios';

interface FactCheckResponse {
  verdict: string;
  explanation: string;
  sources: { url: string; snippet: string }[];
  articleTitle?: string;
  error?: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [currentInput, setCurrentInput] = useState<{ claim?: string; url?: string }>({});
  const [error, setError] = useState('');

  const handleFactCheck = async (data: { claim?: string; url?: string }) => {
    setIsLoading(true);
    setError('');
    setResult(null);
    setCurrentInput(data);

    try {
      const response = await axios.post('/api/factcheck', data);
      setResult(response.data);
    } catch (error) {
      console.error('Fact check error:', error);
      setError('Failed to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className="text-center mb-16 pt-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 mb-6 leading-tight">
            FactCheck<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Unleash the power of AI to verify news claims, debunk myths, and discover the truth behind headlines
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Reliable Sources</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>PDF Reports</span>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto">
          <ClaimForm onSubmit={handleFactCheck} isLoading={isLoading} />
          
          {isLoading && (
            <div className="mt-12 text-center">
              <div className="inline-block p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-purple-200 border-b-purple-500 rounded-full animate-spin animate-reverse"></div>
                  </div>
                  <div className="text-white">
                    <p className="text-lg font-semibold mb-1">Analyzing your {currentInput.url ? 'article' : 'claim'}</p>
                    <p className="text-sm text-gray-300">This may take a few moments...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="p-6 bg-red-500/10 backdrop-blur-lg border border-red-500/20 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-300">Error</h3>
                </div>
                <p className="text-red-100 mb-4">{error}</p>
                <button 
                  onClick={() => handleFactCheck(currentInput)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {result && !result.error && (
            <FactCheckResult
              claim={currentInput.claim || 'Article content'}
              verdict={result.verdict}
              explanation={result.explanation}
              sources={result.sources}
              articleTitle={result.articleTitle}
              sourceUrl={currentInput.url}
            />
          )}

          {result?.error && (
            <div className="mt-12 max-w-2xl mx-auto">
              <div className="p-6 bg-red-500/10 backdrop-blur-lg border border-red-500/20 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-red-300">Processing Error</h3>
                </div>
                <p className="text-red-100">{result.error}</p>
              </div>
            </div>
          )}
        </main>

        {/* Features Section */}
        {!result && !isLoading && (
          <section className="mt-24 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose FactCheckAI?</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">Advanced AI technology meets reliable fact-checking for unparalleled accuracy</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast</h3>
                <p className="text-gray-300">Get instant fact-checks powered by cutting-edge AI technology</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Highly Accurate</h3>
                <p className="text-gray-300">Cross-references multiple reliable sources for maximum accuracy</p>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">PDF Reports</h3>
                <p className="text-gray-300">Download comprehensive reports with sources and explanations</p>
              </div>
            </div>
          </section>
        )}

        <footer className="text-center mt-20 py-8 border-t border-white/10">
          <p className="text-gray-400">
            Powered by advanced AI • Built for truth seekers • 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-medium"> FactCheckAI</span>
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-reverse {
          animation-direction: reverse;
        }
      `}</style>
    </div>
  );
}
