import React from 'react';

// TypeScript interfaces for type safety
interface LedgerItem {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
  runningBalance?: string; // Calculated, formatted as string
}

interface LedgerReportProps {
  // Optional: Add props for filters or data if needed
}

const LedgerReport: React.FC<LedgerReportProps> = () => {
  // Mock data, replace with API data in a real application
  const ledgerData: LedgerItem[] = [
    {
      date: '2025-10-01',
      particulars: 'Sale to John Doe',
      debit: 0.0,
      credit: 1000.0,
    },
    {
      date: '2025-10-05',
      particulars: 'Payment from Jane Smith',
      debit: 500.0,
      credit: 0.0,
    },
    {
      date: '2025-10-10',
      particulars: 'Sales Return - Alex Brown',
      debit: 200.0,
      credit: 0.0,
    },
    {
      date: '2025-10-12',
      particulars: 'Sale to Jane Smith',
      debit: 0.0,
      credit: 700.0,
    },
  ];

  // Calculate derived fields
  const calculatedLedgerData: LedgerItem[] = ledgerData.reduce((acc, item, index) => {
    const previousBalance = index === 0 ? 0 : parseFloat(acc[index - 1].runningBalance || '0');
    const runningBalance = previousBalance + item.debit - item.credit;
    return [
      ...acc,
      {
        ...item,
        runningBalance: runningBalance.toFixed(2),
      },
    ];
  }, [] as LedgerItem[]);

  return (
    <div className="bg-gray-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-md">
          Ledger Report
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
                <th className="p-4 font-semibold text-blue-900">Date</th>
                <th className="p-4 font-semibold text-blue-900">Particulars</th>
                <th className="p-4 font-semibold text-blue-900">Debit</th>
                <th className="p-4 font-semibold text-blue-900">Credit</th>
                <th className="p-4 font-semibold text-blue-900">Running Balance</th>
              </tr>
            </thead>
            <tbody className="animate-fade-in">
              {calculatedLedgerData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-blue-50"
                >
                  <td className="p-4">{item.date}</td>
                  <td className="p-4">{item.particulars}</td>
                  <td className="p-4">{item.debit.toFixed(2)}</td>
                  <td className="p-4">{item.credit.toFixed(2)}</td>
                  <td className="p-4">{item.runningBalance}</td>
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

export default LedgerReport;