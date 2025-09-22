import React, { useState, useMemo } from 'react';
import { User, Communication } from '../data/mockData';
import AiAssistantModal from './AiAssistantModal';

interface CommunicateProps {
    affiliates: User[];
    communications: Communication[];
    onSend: (communication: Omit<Communication, 'id' | 'date'>) => void;
}

const Communicate: React.FC<CommunicateProps> = ({ affiliates, communications, onSend }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [recipients, setRecipients] = useState<'All' | 'Active' | 'Pending'>('All');
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    const recipientCount = useMemo(() => {
        if (recipients === 'All') return affiliates.length;
        return affiliates.filter(a => a.status === recipients).length;
    }, [affiliates, recipients]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            alert("Subject and message are required.");
            return;
        }
        onSend({ subject, message, recipients });
        setSubject('');
        setMessage('');
    };

    const handleUseAiText = (generatedSubject: string, generatedBody: string) => {
        setSubject(generatedSubject);
        setMessage(generatedBody);
        setIsAiModalOpen(false);
    };

    return (
        <>
        {isAiModalOpen && (
            <AiAssistantModal 
                onClose={() => setIsAiModalOpen(false)}
                onApplyText={handleUseAiText}
            />
        )}
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Communicate with Affiliates</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Compose Message</h3>
                            <button 
                                onClick={() => setIsAiModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400 font-semibold rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/80 text-sm"
                                title="Generate with AI"
                            >
                                ✨ Generate with AI
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                                <textarea
                                    id="message"
                                    rows={8}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="recipients" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Send to</label>
                                <select
                                    id="recipients"
                                    value={recipients}
                                    onChange={e => setRecipients(e.target.value as 'All' | 'Active' | 'Pending')}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                >
                                    <option value="All">All Affiliates</option>
                                    <option value="Active">Active Affiliates</option>
                                    <option value="Pending">Pending Affiliates</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75"
                            >
                                Send Message to {recipientCount} {recipientCount === 1 ? 'affiliate' : 'affiliates'}
                            </button>
                        </form>
                    </div>
                </div>
                <div className="lg:col-span-2">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Communication History</h3>
                        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                            {communications.length > 0 ? communications.map(comm => (
                                <div key={comm.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-white">{comm.subject}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Sent on {new Date(comm.date).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full">
                                            To: {comm.recipients}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{comm.message}</p>
                                </div>
                            )) : (
                                <p className="text-center py-10 text-gray-500 dark:text-gray-400">No messages sent yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Communicate;