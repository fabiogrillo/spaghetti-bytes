import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashAlt, FaEdit, FaChevronDown } from "react-icons/fa";
import { BiTime } from "react-icons/bi";

const ResponsiveTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  title,
  colorScheme = "cartoon-pink" 
}) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto rounded-cartoon shadow-cartoon border-2 border-black">
      <table className="w-full">
        <thead className={`bg-${colorScheme} text-white`}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-left font-bold">
                {col.label}
              </th>
            ))}
            <th className="px-6 py-4 text-center font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((item, index) => (
            <motion.tr
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4">
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(item._id)}
                    className="btn btn-sm bg-cartoon-yellow text-black shadow-cartoon-sm hover:shadow-cartoon"
                  >
                    <FaEdit />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(item._id)}
                    className="btn btn-sm btn-error shadow-cartoon-sm hover:shadow-cartoon"
                  >
                    <FaTrashAlt />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={item._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-cartoon shadow-cartoon border-2 border-black overflow-hidden"
        >
          {/* Card Header */}
          <div
            className={`bg-${colorScheme} text-white p-4 flex justify-between items-center cursor-pointer`}
            onClick={() => toggleRow(item._id)}
          >
            <h3 className="font-bold text-lg line-clamp-1">
              {item.title || item.name || `Item ${index + 1}`}
            </h3>
            <motion.div
              animate={{ rotate: expandedRows.has(item._id) ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaChevronDown />
            </motion.div>
          </div>

          {/* Card Body */}
          <AnimatePresence>
            {expandedRows.has(item._id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {columns.map((col) => (
                    <div key={col.key} className="flex flex-col">
                      <span className="text-sm text-gray-600 font-semibold">
                        {col.label}:
                      </span>
                      <span className="text-gray-800">
                        {col.render ? col.render(item) : item[col.key]}
                      </span>
                    </div>
                  ))}
                  
                  {/* Actions */}
                  <div className="pt-4 flex gap-3 border-t-2 border-dashed border-gray-300">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item._id);
                      }}
                      className="flex-1 btn bg-cartoon-yellow text-black shadow-cartoon-sm hover:shadow-cartoon"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item._id);
                      }}
                      className="flex-1 btn btn-error shadow-cartoon-sm hover:shadow-cartoon"
                    >
                      <FaTrashAlt className="mr-2" /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <BiTime />
          <span>{data.length} items total</span>
        </div>
      </div>

      {/* Table Content */}
      {data.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-cartoon shadow-cartoon border-2 border-black">
          <p className="text-xl text-gray-500">No items found</p>
          <p className="text-gray-400 mt-2">Create your first one to get started!</p>
        </div>
      ) : (
        <>
          <DesktopTable />
          <MobileCards />
        </>
      )}
    </div>
  );
};

export default ResponsiveTable;