import React from 'react';

// TypeScript interfaces for type safety
interface OutstandingItem {
  partyName: string;
  openingBalance: number;
  debitAmount: number;
  creditAmount: number;
  netOutstanding?: string; // Calculated, formatted as string
}

interface OutstandingReportProps {
  // Optional: Add props for filters or data if needed
}

const OutstandingReport: React.FC<OutstandingReportProps> = () => {
  // Mock data, replace with API data in a real application
  const outstandingData: OutstandingItem[] = [
    {
      partyName: 'John Doe',
      openingBalance: 1000.0,
      debitAmount: 500.0,
      creditAmount: 300.0,
    },
    {
      partyName: 'Jane Smith',
      openingBalance: 2000.0,
      debitAmount: 700.0,
      creditAmount: 400.0,
    },
    {
      partyName: 'Alex Brown',
      openingBalance: 1500.0,
      debitAmount: 200.0,
      creditAmount: 600.0,
    },
  ];

  // Calculate derived fields
  const calculatedOutstandingData: OutstandingItem[] = outstandingData.map((item) => {
    const netOutstanding = item.openingBalance + item.debitAmount - item.creditAmount;
    return {
      ...item,
      netOutstanding: netOutstanding.toFixed(2),
    };
  });

  return (
    <div className="bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Outstanding Report
        </h1>
        <div className="flex gap-3 items-center">
          <input
            type="date"
            className="p-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 transition duration-200"
            defaultValue="2025-10-14"
          />
          <span className="text-sm text-gray-200">to</span>
          <input
            type="date"
            className="p-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 transition duration-200"
            defaultValue="2025-10-14"
          />
        </div>
      </div>

      {/* Report Table */}
      <div className="mt-6 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-800">
            <thead className="bg-gradient-to-r from-blue-100 to-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-4 font-semibold text-blue-900">Party Name</th>
                <th className="p-4 font-semibold text-blue-900">Opening Balance</th>
                <th className="p-4 font-semibold text-blue-900">Debit Amount</th>
                <th className="p-4 font-semibold text-blue-900">Credit Amount</th>
                <th className="p-4 font-semibold text-blue-900">Net Outstanding</th>
              </tr>
            </thead>
            <tbody className="animate-fade-in">
              {calculatedOutstandingData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-blue-50"
                >
                  <td className="p-4">{item.partyName}</td>
                  <td className="p-4">{item.openingBalance.toFixed(2)}</td>
                  <td className="p-4">{item.debitAmount.toFixed(2)}</td>
                  <td className="p-4">{item.creditAmount.toFixed(2)}</td>
                  <td className="p-4">{item.netOutstanding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap gap-3 mt-6 ms-2">
        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Export to CSV
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Print
        </button>
        <button
          type="button"
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default OutstandingReport;