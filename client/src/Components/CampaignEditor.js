import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BiX, BiSave } from 'react-icons/bi';
import TipTapEditor from './TipTapEditor';

const CampaignEditor = ({ campaign, templateData, onSave, onClose }) => {
    const [subject, setSubject] = useState('');
    const [preheader, setPreheader] = useState('');
    const [content, setContent] = useState('');
    const [scheduledFor, setScheduledFor] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (campaign) {
            setSubject(campaign.subject || '');
            setPreheader(campaign.preheader || '');
            setContent(campaign.content || '');
            setScheduledFor(campaign.scheduledFor || '');
        } else if (templateData) {
            setSubject(templateData.subject || '');
            setPreheader(templateData.preheader || '');
            setContent(templateData.body || '');
        }
    }, [campaign, templateData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            await onSave({
                subject,
                preheader,
                content,
                scheduledFor: scheduledFor || null
            });
        } catch (error) {
            console.error('Error saving campaign:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-cartoon shadow-cartoon border-2 border-black w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold">
                        {campaign ? 'Edit Campaign' : 'Create New Campaign'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm rounded-cartoon"
                    >
                        <BiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Subject */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-bold">Subject Line *</span>
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="input input-bordered rounded-cartoon"
                            placeholder="Enter email subject..."
                            required
                        />
                    </div>

                    {/* Preheader */}
                    <div className="form-control mb-4">
                        <label className="label">
                            <span className="label-text font-bold">Preheader Text</span>
                            <span className="label-text-alt text-xs">Preview text shown in inbox</span>
                        </label>
                        <input
                            type="text"
                            value={preheader}
                            onChange={(e) => setPreheader(e.target.value)}
                            className="input input-bordered rounded-cartoon"
                            placeholder="Enter preheader text..."
                        />
                    </div>

                    {/* Schedule */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-bold">Schedule For (Optional)</span>
                            <span className="label-text-alt text-xs">Leave empty to save as draft</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledFor}
                            onChange={(e) => setScheduledFor(e.target.value)}
                            className="input input-bordered rounded-cartoon"
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    {/* Content */}
                    <div className="form-control mb-6">
                        <label className="label">
                            <span className="label-text font-bold">Email Content *</span>
                        </label>
                        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-cartoon p-4 min-h-[300px]">
                            <TipTapEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Write your email content here..."
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-ghost rounded-cartoon"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary rounded-cartoon"
                        disabled={saving || !subject || !content}
                    >
                        {saving ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <BiSave />
                                {campaign ? 'Update' : 'Save'} Campaign
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CampaignEditor;