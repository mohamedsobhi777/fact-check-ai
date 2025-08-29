'use client';

import { jsPDF } from 'jspdf';

interface FactCheckResultProps {
  claim: string;
  verdict: string;
  explanation: string;
  sources: { url: string; snippet: string }[];
}

export default function FactCheckResult({ claim, verdict, explanation, sources }: FactCheckResultProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('FactCheckAI Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Claim:', 20, 40);
    const claimLines = doc.splitTextToSize(claim, 160);
    doc.text(claimLines, 20, 50);
    
    const claimHeight = claimLines.length * 7;
    let currentY = 50 + claimHeight + 10;
    
    doc.text(`Verdict: ${verdict}`, 20, currentY);
    currentY += 15;
    
    doc.text('Explanation:', 20, currentY);
    currentY += 10;
    const explanationLines = doc.splitTextToSize(explanation, 160);
    doc.text(explanationLines, 20, currentY);
    
    const explanationHeight = explanationLines.length * 7;
    currentY += explanationHeight + 15;
    
    if (sources.length > 0) {
      doc.text('Sources:', 20, currentY);
      currentY += 10;
      
      sources.forEach((source, i) => {
        if (currentY > 270) {
          doc.addPage();
          currentY = 20;
        }
        
        doc.text(`${i + 1}. ${source.snippet}`, 20, currentY);
        currentY += 7;
        
        if (source.url) {
          const urlLines = doc.splitTextToSize(source.url, 160);
          doc.text(urlLines, 25, currentY);
          currentY += urlLines.length * 7 + 5;
        }
      });
    }
    
    doc.save('FactCheckAI_Report.pdf');
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'true':
        return 'text-green-600 bg-green-100 border-green-300';
      case 'false':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'misleading':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="mt-8 p-6 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Fact Check Result</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Claim:</h3>
        <p className="text-gray-600 bg-gray-50 p-3 rounded border">{claim}</p>
      </div>
      
      <div className="mb-6">
        <span className={`inline-block px-4 py-2 rounded-full border font-semibold text-lg ${getVerdictColor(verdict)}`}>
          Verdict: {verdict}
        </span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Explanation:</h3>
        <p className="text-gray-600 leading-relaxed">{explanation}</p>
      </div>
      
      {sources.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Sources:</h3>
          <ul className="space-y-3">
            {sources.map((source, index) => (
              <li key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                {source.url ? (
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    {source.snippet}
                  </a>
                ) : (
                  <span className="text-gray-700">{source.snippet}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={generatePDF}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Download PDF Report
      </button>
    </div>
  );
}