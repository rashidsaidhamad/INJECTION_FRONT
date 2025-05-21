import React, { useState } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Detection = () => {
  const [sqlQuery, setSqlQuery] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add your ML detection logic here
    // This is just a placeholder result
    setResult({
      isMalicious: true,
      confidence: 95,
      warnings: ['Possible UNION attack detected', 'Comment injection pattern found']
    });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <ShieldCheckIcon className="h-8 w-8 mr-2 text-blue-600" />
          SQL Query Analysis
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Enter SQL Query</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your SQL query here..."
            />
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            Analyze & Detect
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
            
            <div className={`p-4 rounded-lg ${result.isMalicious ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center mb-3">
                {result.isMalicious ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                )}
                <span className={`font-semibold ${result.isMalicious ? 'text-red-600' : 'text-green-600'}`}>
                  {result.isMalicious ? 'Malicious Query Detected' : 'Normal Query'}
                </span>
              </div>

              {result.isMalicious && (
                <div className="ml-8">
                  <div className="text-sm text-gray-600 mb-2">
                    Confidence: {result.confidence}%
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Warnings:</span>
                    <ul className="list-disc ml-5 mt-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index} className="text-red-600">{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Detection;