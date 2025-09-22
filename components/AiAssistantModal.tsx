



import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AiAssistantModalProps {
  onClose: () => void;
  onApplyText: (subject: string, body: string) => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500"></div>
    </div>
);

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ onClose, onApplyText }) => {
    const [goal, setGoal] = useState('');
    const [tone, setTone] = useState('Friendly & Casual');
    const [cta, setCta] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedText, setGeneratedText] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!goal) {
            setError('Please describe the goal of your message.');
            return;
        }
        setError('');
        setIsLoading(true);
        setGeneratedText('');

        const prompt = `You are an expert marketing copywriter specializing in affiliate communications for online creators. 
        Your task is to write a message to affiliates.

        **Instructions:**
        1.  The output must start with "Subject: [Your Subject Here]".
        2.  After the subject line, add two new lines.
        3.  Then, write the message body.
        4.  The message should be based on the following details.

        **Message Details:**
        - **Goal/Topic:** ${goal}
        - **Tone of Voice:** ${tone}
        ${cta ? `- **Call to Action:** ${cta}` : ''}

        **Example Output:**
        Subject: Exciting News!
        
        Hi team,
        
        I'm thrilled to announce...`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setGeneratedText(response.text);
        } catch (e) {
            console.error(e);
            setError('An error occurred while generating the text. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        if (!generatedText) return;

        const subjectMatch = generatedText.match(/^Subject:\s*(.*)/);
        const subject = subjectMatch ? subjectMatch[1] : 'Update';
        
        const body = generatedText.replace(/^Subject:\s*.*\n\n?/, '');

        onApplyText(subject, body);
    };

    const renderForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">What is the goal of this message?</label>
                <input
                    type="text"
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., Announce a new product, run a contest..."
                />
            </div>
            <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone of Voice</label>
                <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option>Friendly & Casual</option>
                    <option>Professional</option>
                    <option>Excited & Hype</option>
                    <option>Urgent</option>
                </select>
            </div>
            <div>
                <label htmlFor="cta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Call to Action (Optional)</label>
                <input
                    type="text"
                    id="cta"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., Get their new affiliate links"
                />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );

    const renderResult = () => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated Text:</label>
            <textarea
                readOnly
                value={generatedText}
                rows={12}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">✨ AI Message Assistant</h2>
                </div>
                <div className="p-6 overflow-y-auto flex-grow min-h-[300px]">
                    {isLoading ? <LoadingSpinner /> : generatedText ? renderResult() : renderForm()}
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <div className="flex items-center gap-3">
                        {generatedText && (
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
                            >
                                Use This Text
                            </button>
                        )}
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 disabled:opacity-50"
                        >
                            {isLoading ? 'Generating...' : generatedText ? 'Regenerate' : 'Generate'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiAssistantModal;