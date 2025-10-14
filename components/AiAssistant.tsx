
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { User, Product, Payout } from '../data/mockData';

interface AiAssistantProps {
    affiliates: User[];
    products: Product[];
    payouts: Payout[];
}

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse [animation-delay:0.2s]"></div>
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse [animation-delay:0.4s]"></div>
    </div>
);

const AiAssistant: React.FC<AiAssistantProps> = ({ affiliates, products, payouts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const formatContextData = (): string => {
        const summary = {
            affiliates: affiliates.map(a => ({ name: a.name, sales: a.sales, commission: a.commission, status: a.status })),
            products: products.map(p => ({ name: p.name, price: p.price, sales: p.sales_count })),
            payouts: {
                due: payouts.filter(p => p.status === 'Due').reduce((sum, p) => sum + p.amount, 0),
                paid: payouts.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
            }
        };
        return JSON.stringify(summary, null, 2);
    };

    const handleSendPrompt = async () => {
        if (!prompt.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', text: prompt };
        setMessages(prev => [...prev, userMessage]);
        setPrompt('');
        setIsLoading(true);
        setError('');

        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
        if (!apiKey) {
            setError('The AI Assistant has not been configured. An API key is missing.');
            setIsLoading(false);
            return;
        }

        const contextData = formatContextData();
        const fullPrompt = `You are a helpful assistant for PartnerFlow, an affiliate management SaaS. 
        Your user is a creator managing their program.
        Analyze the following data and answer the user's question. 
        Provide concise, clear, and friendly answers. Use the data to back up your response.

        Current Date: ${new Date().toLocaleDateString()}
        
        DATA SUMMARY:
        ${contextData}

        USER QUESTION:
        ${prompt}`;

        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
            });

            const assistantMessage: Message = { role: 'assistant', text: response.text };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (e: any) {
            console.error(e);
            setError('Sorry, I had trouble connecting to the AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-cyan-500 text-white rounded-full p-4 shadow-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transform hover:scale-110 transition-transform duration-200 z-30"
                aria-label="Open AI Assistant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0m-8.486-2.828l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end sm:items-center" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                ✨ AI Assistant
                            </h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </header>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {messages.length === 0 && !error && (
                                <div className="text-center text-gray-500 dark:text-gray-400 pt-10">
                                    <p>Ask me anything about your affiliate program!</p>
                                    <p className="text-sm mt-2">e.g., "Who are my top 3 affiliates?" or "Summarize my sales."</p>
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-md p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                        <LoadingSpinner />
                                    </div>
                                </div>
                            )}
                             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div ref={chatEndRef} />
                        </div>

                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSendPrompt()}
                                    placeholder="Ask about your affiliates, sales, products..."
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                                />
                                <button
                                    onClick={handleSendPrompt}
                                    disabled={isLoading || !prompt.trim()}
                                    className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiAssistant;