
import React, { useState } from 'react';
import { User } from '../data/mockData';

interface OnboardingModalProps {
  currentUser: User;
  onStepChange: (step: number) => void;
  onAddProduct: (name: string, price: number) => void;
  onInviteAffiliate: (email: string) => void;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ currentUser, onStepChange, onAddProduct, onInviteAffiliate, onComplete, onSkip }) => {
  const [step, setStep] = useState((currentUser.onboardingStepCompleted || 0) + 1);
  const [copied, setCopied] = useState(false);
  const totalSteps = 5;

  // State for interactive steps
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [affiliateEmail, setAffiliateEmail] = useState('');
  const [affiliateEmailError, setAffiliateEmailError] = useState('');

  const trackingCode = `<script>
// PartnerFlow Tracking Pixel
// Place this on your order confirmation page before the </body> tag.
(function() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) {
    // This example uses a 30-day cookie.
    const d = new Date();
    d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = "partnerflow_ref=" + ref + ";" + expires + ";path=/";
  }
})();
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextStep = () => {
      onStepChange(step);
      setStep(s => Math.min(s + 1, totalSteps));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const handleAddProduct = () => {
      if(productName && productPrice) {
          onAddProduct(productName, parseFloat(productPrice));
          nextStep();
      }
  };
  
  const handleInviteAffiliate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!affiliateEmail || !emailRegex.test(affiliateEmail)) {
      setAffiliateEmailError('Please enter a valid email address.');
      return;
    }
    setAffiliateEmailError('');
    onInviteAffiliate(affiliateEmail);
    nextStep();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Welcome to PartnerFlow, {currentUser.name.split(' ')[0]}!</h3>
            <p className="text-gray-600 dark:text-gray-300">We're excited to help you launch and grow your affiliate program. Let's get you set up in just a few steps.</p>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Add your first product</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Let's start by adding a product you want affiliates to promote.</p>
            <div className="space-y-3">
                 <div>
                    <label htmlFor="onboarding-product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                    <input type="text" id="onboarding-product-name" value={productName} onChange={e => setProductName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., My Pro Course"/>
                </div>
                 <div>
                    <label htmlFor="onboarding-product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input type="number" id="onboarding-product-price" value={productPrice} onChange={e => setProductPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., 499"/>
                </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">The Magic Ingredient: Tracking</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">To automatically track sales of "{productName}", add this code to your website's order confirmation page, right before the closing <code>&lt;/body&gt;</code> tag.</p>
            <div className="relative">
                <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{trackingCode}</code>
                </pre>
                <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-md hover:bg-cyan-600">
                    {copied ? 'Copied!' : 'Copy Code'}
                </button>
            </div>
          </>
        );
       case 4:
        return (
           <>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Invite your first affiliate</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Send an invitation to someone you'd like to partner with.</p>
             <div>
                <label htmlFor="onboarding-affiliate-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Affiliate's Email</label>
                <input
                    type="email"
                    id="onboarding-affiliate-email"
                    value={affiliateEmail}
                    onChange={e => { setAffiliateEmail(e.target.value); setAffiliateEmailError(''); }}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="name@example.com"
                />
                {affiliateEmailError && <p className="text-red-500 text-sm mt-1">{affiliateEmailError}</p>}
            </div>
          </>
        );
      case 5:
        return (
          <>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">You're All Set!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Congratulations! You've set up the basics of your affiliate program.</p>
            <ul className="space-y-3">
              <li className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>You added your first product: <strong>{productName}</strong></span>
              </li>
              <li className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>You invited your first affiliate: <strong>{affiliateEmail}</strong></span>
              </li>
            </ul>
          </>
        );
      default:
        return null;
    }
  };

  const renderButtons = () => {
    switch(step) {
        case 1:
        case 3:
            return <button onClick={nextStep} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Next</button>;
        case 2:
            return <button onClick={handleAddProduct} disabled={!productName || !productPrice} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600 disabled:opacity-50">Add Product & Continue</button>;
        case 4:
            return <button onClick={handleInviteAffiliate} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Send Invite & Continue</button>;
        case 5:
            return <button onClick={onComplete} className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-600">Let's Go!</button>;
        default:
            return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 sm:p-8 transform transition-all" role="dialog" aria-modal="true">
        <div className="min-h-[250px] flex flex-col justify-center">
            {renderStepContent()}
        </div>
        
        <div className="flex items-center justify-between mt-6">
            <div>
                {step < 5 && (
                    <button onClick={onSkip} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline">
                        Do this later
                    </button>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className={`h-2 w-8 rounded-full transition-colors ${step > i ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    ))}
                </div>
                <div className="space-x-3">
                    {step > 1 && step < 5 && (
                        <button onClick={prevStep} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                            Back
                        </button>
                    )}
                    {renderButtons()}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;