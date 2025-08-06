import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiSearch, BiFilter, BiDownload, BiEnvelope, BiCheckCircle, BiXCircle, BiTime } from 'react-icons/bi';
import { FaSpinner } from 'react-icons/fa';
import api from '../Api';
import toast from 'react-hot-toast';

const NewsletterSubscribersTable = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [filteredSubscribers, setFilteredSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortField, setSortField] = useState('dates.subscribedAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Fetch subscribers
    useEffect(() => {
        fetchSubscribers();
    }, []);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/newsletter/subscribers');
            setSubscribers(response.data.subscribers || []);
            setFilteredSubscribers(response.data.subscribers || []);
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            toast.error('Failed to load subscribers');
            setSubscribers([]);
            setFilteredSubscribers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter and search logic
    useEffect(() => {
        let filtered = [...subscribers];

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(sub => sub.status === statusFilter);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(sub =>
                sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = sortField.includes('.') 
                ? sortField.split('.').reduce((obj, key) => obj?.[key], a)
                : a[sortField];
            let bVal = sortField.includes('.')
                ? sortField.split('.').reduce((obj, key) => obj?.[key], b)
                : b[sortField];

            if (sortField.includes('date') || sortField.includes('At')) {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        setFilteredSubscribers(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [subscribers, searchTerm, statusFilter, sortField, sortOrder]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSubscribers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Email', 'First Name', 'Last Name', 'Status', 'Source', 'Subscribed Date', 'Last Opened'];
        const csvData = filteredSubscribers.map(sub => [
            sub.email,
            sub.firstName || '',
            sub.lastName || '',
            sub.status,
            sub.metadata?.source || '',
            new Date(sub.dates?.subscribedAt).toLocaleDateString(),
            sub.engagement?.lastOpened ? new Date(sub.engagement.lastOpened).toLocaleDateString() : 'Never'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Subscribers exported successfully!');
    };

    // Status badge component
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            active: { icon: BiCheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
            pending: { icon: BiTime, color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
            unsubscribed: { icon: BiXCircle, color: 'bg-red-100 text-red-800', label: 'Unsubscribed' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="mr-1" />
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-cartoon-pink" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon p-6">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                    Newsletter Subscribers
                </h2>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by email, name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-cartoon 
                                     focus:ring-2 focus:ring-cartoon-pink focus:border-transparent
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <BiFilter className="text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-cartoon 
                                     focus:ring-2 focus:ring-cartoon-pink focus:border-transparent
                                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="unsubscribed">Unsubscribed</option>
                        </select>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={exportToCSV}
                        className="btn btn-secondary rounded-cartoon shadow-cartoon-sm 
                                 hover:shadow-cartoon flex items-center gap-2"
                    >
                        <BiDownload />
                        Export CSV
                    </button>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Total: <strong>{filteredSubscribers.length}</strong></span>
                    <span>Active: <strong>{filteredSubscribers.filter(s => s.status === 'active').length}</strong></span>
                    <span>Pending: <strong>{filteredSubscribers.filter(s => s.status === 'pending').length}</strong></span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th 
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                                onClick={() => {
                                    setSortField('dates.subscribedAt');
                                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                Subscribed {sortField === 'dates.subscribedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Engagement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentItems.map((subscriber) => (
                            <motion.tr 
                                key={subscriber._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <BiEnvelope className="mr-2 text-gray-400" />
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                                            {subscriber.email}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-gray-200">
                                        {subscriber.firstName || subscriber.lastName 
                                            ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                                            : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={subscriber.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {subscriber.metadata?.source || 'Direct'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(subscriber.dates?.subscribedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <div>Opens: {subscriber.engagement?.openCount || 0}</div>
                                        <div>Clicks: {subscriber.engagement?.clickCount || 0}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            // You can implement resend confirmation or other actions here
                                            toast.info('Action not implemented yet');
                                        }}
                                        className="text-cartoon-pink hover:text-cartoon-purple"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSubscribers.length)} of {filteredSubscribers.length} entries
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-cartoon border border-gray-300 dark:border-gray-600
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Previous
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 rounded-cartoon border ${
                                    currentPage === i + 1
                                        ? 'bg-cartoon-pink text-white border-cartoon-pink'
                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-cartoon border border-gray-300 dark:border-gray-600
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewsletterSubscribersTable;