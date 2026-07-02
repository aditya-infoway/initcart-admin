import React, { useState } from "react";
import { motion } from "framer-motion";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  FaDownload,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

// Generic type constraint with id property
interface Identifiable {
  id: string | number;
}

// More flexible Column interface that doesn't extend Identifiable
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends Identifiable> {
  data: T[];
  columns: Column<T>[];
  onDownload?: (item: T) => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  onApprove?: (item: T) => void;
  onReject?: (item: T) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  title?: string;
  loading?: boolean;
  customActions?: Array<{
    label: string | ((item: T) => string);
    onClick: (item: T) => void;
    className?: string | ((item: T) => string);
  }>;
  // Optional properties for other files
  showExport?: boolean;
  exportFileName?: string;
  emptyMessage?: string;
  onRefresh?: () => void;
  showActions?: boolean; // ✅ Added showActions prop
}

const DataTable = <T extends Identifiable>({
  data,
  columns,
  onDownload,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onAdd,
  addButtonLabel = "Add",
  title,
  loading = false,
  customActions = [],
  // Destructure optional props with defaults
  showExport = false,
  exportFileName = "export",
  emptyMessage = "No data available.",
  onRefresh,
  showActions = true, // ✅ Default value
}: DataTableProps<T>) => {
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);

  const totalPages = Math.ceil(data.length / limit);
  const paginatedData = data.slice(offset, offset + limit);

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * limit;
    setOffset(newOffset);
  };

  // Handle export functionality
  const handleExport = () => {
    // Simple CSV export logic
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item =>
      columns.map(col => {
        const value = col.render ? col.render(item) : (item as any)[col.key];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
        <div className="flex justify-between flex-col lg:flex-row items-center mb-6">
          <div className="text-start w-full">
            {title && (
              <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
            )}
          </div>
          {(showExport || onRefresh) && (
            <div className="flex gap-2 mt-4 lg:mt-0">
              {onRefresh && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRefresh}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg cursor-pointer"
                >
                  Refresh
                </motion.button>
              )}
              {showExport && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
                >
                  <FaDownload className="inline mr-2" />
                  Export
                </motion.button>
              )}
            </div>
          )}
        </div>
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center py-20">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine if action column should be shown
  const showActionColumn = showActions && (
    onEdit ||
    onDelete ||
    onView ||
    onDownload ||
    onApprove ||
    onReject ||
    customActions.length > 0
  );

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-2xl shadow-md">
      {/* Header */}
      <div className="flex justify-between flex-col lg:flex-row items-center mb-6">
        <div className="text-start w-full">
          {title && (
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
          )}
        </div>
        <div className="flex gap-2 mt-4 lg:mt-0">
          {(showExport || onRefresh) && (
            <>
              {onRefresh && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRefresh}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg cursor-pointer"
                >
                  Refresh
                </motion.button>
              )}
              {showExport && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer"
                >
                  <FaDownload className="inline mr-2" />
                  Export
                </motion.button>
              )}
            </>
          )}
          {onAdd && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all duration-200 cursor-pointer"
            >
              + {addButtonLabel}
            </motion.button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-100 overflow-x-auto">
        <table className="text-sm text-gray-700 w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left font-semibold text-gray-600">
                #
              </th>

              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="px-6 py-4 text-left font-semibold text-gray-600 border-r border-gray-200 last:border-r-0"
                >
                  {col.label}
                </th>
              ))}
              {showActionColumn && (
                <th className="px-6 py-4 text-center font-semibold text-gray-600">
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <motion.tr
                key={item.id}
                whileHover={{ backgroundColor: "#f9fafb" }}
                transition={{ duration: 0.2 }}
                className="border-b border-gray-100"
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {offset + index + 1}
                </td>

                {/* Columns FIRST */}
                {columns.map((col) => (
                  <td
                    key={col.key as string}
                    className="px-6 py-4 border-r border-gray-200 last:border-r-0"
                  >
                    {col.render ? col.render(item) : (item as any)[col.key]}
                  </td>
                ))}

                {/* Action LAST */}
                {showActionColumn && (
                  <td className="px-6 py-4 text-center border-l border-gray-300">
                    <div className="flex flex-wrap justify-center gap-2">

                      {onView && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => onView(item)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title="View"
                        >
                          <FaEye size={22} />
                        </motion.button>
                      )}

                      {onDownload && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => onDownload(item)}
                          className="text-green-600 hover:text-green-700 cursor-pointer"
                          title="Download"
                        >
                          <FaDownload size={22} />
                        </motion.button>
                      )}

                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => onEdit(item)}
                          className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          title="Edit"
                        >
                          <MdEdit size={22} />
                        </motion.button>
                      )}

                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title="Delete"
                        >
                          <MdDelete size={22} />
                        </motion.button>
                      )}

                      {onApprove && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          onClick={() => onApprove(item)}
                          className="text-green-600 hover:text-green-800"
                          title="Approve"
                        >
                          <FaCheckCircle size={20} />
                        </motion.button>
                      )}

                      {onReject && (
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          onClick={() => onReject(item)}
                          className="text-red-600 hover:text-red-800"
                          title="Reject"
                        >
                          <FaTimesCircle size={20} />
                        </motion.button>
                      )}

                      {customActions.map((action, idx) => {
                        const label =
                          typeof action.label === "function"
                            ? action.label(item)
                            : action.label;

                        const className =
                          typeof action.className === "function"
                            ? action.className(item)
                            : action.className ||
                            "px-2 py-1 bg-gray-600 text-white rounded cursor-pointer";

                        return (
                          <motion.button
                            key={idx}
                            onClick={() => action.onClick(item)}
                            className={className}
                            title={label}
                          >
                            {label}
                          </motion.button>
                        );
                      })}
                    </div>
                  </td>
                )}


              </motion.tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showActionColumn ? 2 : 1)
                  }
                  className="text-center py-8 text-gray-500 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
        <div className="flex items-center gap-5 text-sm text-gray-700">
          <div className="flex gap-2 items-center">
            <label htmlFor="limit" className="font-medium text-gray-600">
              Rows per page:
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => {
                const newLimit =
                  e.target.value === "All"
                    ? data.length
                    : parseInt(e.target.value);
                setLimit(newLimit);
                setOffset(0);
              }}
              className="border border-gray-300 rounded-lg px-2 py-1 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {[10, 25, 50].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
              <option value="All">All</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {offset + 1} - {Math.min(offset + limit, data.length)}
            </span>{" "}
            of {data.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(offset / limit)}
            disabled={offset === 0}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${offset === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Prev
          </button>

          {(() => {
            const currentPage = offset / limit + 1;
            const maxVisible = 3;
            const pages: (number | string)[] = [];
            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages, startPage + maxVisible - 1);

            if (startPage > 1) pages.push(1, "...");
            for (let i = startPage; i <= endPage; i++) pages.push(i);
            if (endPage < totalPages) pages.push("...", totalPages);

            return pages.map((p, i) =>
              typeof p === "number" ? (
                <button
                  key={i}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${offset / limit + 1 === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {p}
                </button>
              ) : (
                <span key={i} className="px-2 text-gray-500">
                  {p}
                </span>
              )
            );
          })()}

          <button
            onClick={() => handlePageChange(offset / limit + 2)}
            disabled={offset + limit >= data.length}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${offset + limit >= data.length
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;