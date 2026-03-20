'use client';

/**
 * Credit Recharge Page
 * 
 * Features:
 * - Amount selection (preset + custom)
 * - Real-time GST calculation
 * - Billing details form
 * - GSTIN validation
 * - Razorpay integration
 * - Success/failure handling
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Preset amounts
const PRESET_AMOUNTS = [
    { value: 500, label: '₹500', popular: false, subtitle: 'Standard' },
    { value: 2000, label: '₹2,000', popular: true, subtitle: '+10% Bonus' },
    { value: 5000, label: '₹5,000', popular: true, subtitle: '+15% Bonus' },
    { value: 10000, label: '₹10,000', popular: true, subtitle: '+20% Bonus' },
];

// Indian states
const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export default function RechargePage() {
    const router = useRouter();

    // State
    const [amount, setAmount] = useState<number>(5000);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState(false);

    const [billingDetails, setBillingDetails] = useState({
        name: '',
        address: '',
        state: 'Karnataka',
        pincode: '',
        gstin: '',
        email: '',
        phone: ''
    });

    const [gstCalculation, setGstCalculation] = useState<any>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<any>({});

    const [autoRecharge, setAutoRecharge] = useState({
        enabled: false,
        threshold: 500,
        amount: 1000,
        hasToken: false
    });

    // Fetch initial auto-config
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/credits/recharge/auto-config');
                const data = await res.json();
                if (data.success) {
                    setAutoRecharge({
                        enabled: data.config.auto_recharge_enabled,
                        threshold: Number(data.config.auto_recharge_threshold),
                        amount: Number(data.config.auto_recharge_amount),
                        hasToken: !!data.config.razorpay_token_id
                    });
                }
            } catch (err) {
                console.error("Failed to load auto-config");
            }
        };
        fetchConfig();
    }, []);

    const updateAutoConfig = async (newConfig: typeof autoRecharge) => {
        setAutoRecharge(newConfig);
        try {
            await fetch('/api/credits/recharge/auto-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
        } catch (err) {
            console.error("Failed to save auto-config");
        }
    };

    // Calculate GST when amount or state changes
    useEffect(() => {
        if (amount >= 100) {
            calculateGST();
        }
    }, [amount, billingDetails.state]);

    const calculateGST = async () => {
        setIsCalculating(true);
        setError(null);

        try {
            const response = await fetch('/api/credits/recharge/calculate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    state: billingDetails.state
                })
            });

            const data = await response.json();

            if (data.success) {
                setGstCalculation(data.calculation);
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError('Failed to calculate GST. Please try again.');
        } finally {
            setIsCalculating(false);
        }
    };

    const handleAmountSelect = (value: number) => {
        setAmount(value);
        setIsCustom(false);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (value: string) => {
        setCustomAmount(value);
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > 0) {
            setAmount(numValue);
            setIsCustom(true);
        }
    };

    const validateForm = () => {
        const errors: any = {};

        if (!billingDetails.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!billingDetails.address.trim()) {
            errors.address = 'Address is required';
        }

        if (!billingDetails.pincode.trim()) {
            errors.pincode = 'Pincode is required';
        } else if (!/^\d{6}$/.test(billingDetails.pincode)) {
            errors.pincode = 'Invalid pincode (must be 6 digits)';
        }

        if (billingDetails.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email)) {
            errors.email = 'Invalid email address';
        }

        if (billingDetails.phone && !/^\+?[1-9]\d{9,14}$/.test(billingDetails.phone.replace(/\s/g, ''))) {
            errors.phone = 'Invalid phone number';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRecharge = async () => {
        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create Razorpay order
            const response = await fetch('/api/credits/recharge/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    billingDetails
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            // 2. Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                // 3. Open Razorpay checkout
                const options = {
                    key: data.order.razorpay_key,
                    amount: data.order.amount,
                    currency: data.order.currency,
                    name: 'WhatsApp Credits',
                    description: `Recharge ${data.calculation.formatted.net_amount} credits`,
                    order_id: data.order.id,
                    prefill: {
                        name: billingDetails.name,
                        email: billingDetails.email,
                        contact: billingDetails.phone
                    },
                    theme: {
                        color: '#3b82f6'
                    },
                    handler: async function (response: any) {
                        // Payment successful — verify and add credits
                        try {
                            const verifyRes = await fetch('/api/credits/recharge/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                    amount: data.order.amount,
                                    credits: data.calculation.credits || amount,
                                })
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyData.success) {
                                router.push(`/dashboard/credits?success=true&payment_id=${response.razorpay_payment_id}`);
                            } else {
                                setError('Payment received but credit update failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
                                setIsProcessing(false);
                            }
                        } catch {
                            setError('Payment received. Please refresh your wallet in a moment.');
                            setIsProcessing(false);
                        }
                    },
                    modal: {
                        ondismiss: function () {
                            setIsProcessing(false);
                        }
                    }
                };

                const razorpay = new (window as any).Razorpay(options);
                razorpay.open();
            };

        } catch (err: any) {
            setError(err.message || 'Failed to initiate payment');
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Recharge Credits
                    </h1>
                    <p className="text-gray-600">
                        Add credits to your WhatsApp account with GST-compliant invoicing
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Left Column - Amount Selection */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Select Amount
                        </h2>

                        {/* Preset Amounts */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {PRESET_AMOUNTS.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => handleAmountSelect(preset.value)}
                                    className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200
                    ${amount === preset.value && !isCustom
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    {preset.popular && (
                                        <span className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            Popular
                                        </span>
                                    )}
                                    <div className="text-lg font-semibold text-gray-900">
                                        {preset.label}
                                    </div>
                                    <div className={`text-[10px] font-bold ${preset.subtitle.includes('+') ? 'text-green-600' : 'text-gray-400'}`}>
                                        {preset.subtitle}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Custom Amount */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Amount
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={customAmount}
                                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                                    placeholder="Enter custom amount"
                                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    min="100"
                                    max="1000000"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Min: ₹100 | Max: ₹10,00,000
                            </p>
                        </div>

                        {/* GST Breakdown */}
                        {gstCalculation && (
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                    GST Breakdown
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Credits Amount:</span>
                                        <span className="font-semibold text-gray-900">
                                            {gstCalculation.formatted.net_amount}
                                        </span>
                                    </div>

                                    {gstCalculation.is_same_state ? (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">CGST (9%):</span>
                                                <span className="text-gray-900">
                                                    {gstCalculation.formatted.cgst}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">SGST (9%):</span>
                                                <span className="text-gray-900">
                                                    {gstCalculation.formatted.sgst}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">IGST (18%):</span>
                                            <span className="text-gray-900">
                                                {gstCalculation.formatted.igst}
                                            </span>
                                        </div>
                                    )}

                                    <div className="border-t border-blue-200 pt-2 mt-2">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-gray-900">Total Amount:</span>
                                            <span className="font-bold text-blue-600 text-lg">
                                                {gstCalculation.formatted.total_amount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Billing Details */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Billing Details
                        </h2>

                        <div className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={billingDetails.name}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all ${validationErrors.name ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="John Doe"
                                />
                                {validationErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={billingDetails.address}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all ${validationErrors.address ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="123 Main Street, Bangalore"
                                    rows={2}
                                />
                                {validationErrors.address && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>
                                )}
                            </div>

                            {/* State & Pincode */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={billingDetails.state}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    >
                                        {INDIAN_STATES.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.pincode}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, pincode: e.target.value })}
                                        className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all ${validationErrors.pincode ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                                            }`}
                                        placeholder="560001"
                                        maxLength={6}
                                    />
                                    {validationErrors.pincode && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.pincode}</p>
                                    )}
                                </div>
                            </div>

                            {/* GSTIN & HSN */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        GSTIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.gstin}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, gstin: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        placeholder="29ABCDE1234F1Z5"
                                        maxLength={15}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        For GST businesses
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        HSN No (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={(billingDetails as any).hsn_code || ''}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, hsn_code: e.target.value } as any)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                        placeholder="998311"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Service Code
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={billingDetails.email}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all ${validationErrors.email ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="john@example.com"
                                />
                                {validationErrors.email && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={billingDetails.phone}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-200 transition-all ${validationErrors.phone ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="+919876543210"
                                />
                                {validationErrors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auto-Recharge Settings */}
                <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">⚡ Auto-Recharge</h2>
                            <p className="text-sm text-gray-500">Automatically top-up your balance when it falls below a threshold.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={autoRecharge.enabled}
                                onChange={(e) => updateAutoConfig({ ...autoRecharge, enabled: e.target.checked })}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className={`grid md:grid-cols-2 gap-6 transition-all duration-300 ${autoRecharge.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recharge Threshold (₹)</label>
                            <input
                                type="number"
                                value={autoRecharge.threshold}
                                onChange={(e) => setAutoRecharge({ ...autoRecharge, threshold: parseInt(e.target.value) })}
                                onBlur={() => updateAutoConfig(autoRecharge)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                                placeholder="500"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">When balance is less than this, we recharge.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Recharge Amount (₹)</label>
                            <input
                                type="number"
                                value={autoRecharge.amount}
                                onChange={(e) => setAutoRecharge({ ...autoRecharge, amount: parseInt(e.target.value) })}
                                onBlur={() => updateAutoConfig(autoRecharge)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500"
                                placeholder="1000"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">The amount to be added automatically.</p>
                        </div>
                    </div>

                    {!autoRecharge.hasToken && autoRecharge.enabled && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                            <span className="text-amber-600">⚠️</span>
                            <p className="text-xs text-amber-700">To enable auto-recharge, you must complete one manual payment and select <b>"Save Card for Recurring Payments"</b> at checkout.</p>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                {/* Proceed Button */}
                <div className="mt-6">
                    <button
                        onClick={handleRecharge}
                        disabled={isProcessing || isCalculating || !gstCalculation || amount < 100}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            `Pay ${gstCalculation?.formatted.total_amount || '₹0.00'} via Razorpay`
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-3">
                        🔒 Secure payment powered by Razorpay • GST invoice will be emailed
                    </p>
                </div>
            </div>
        </div>
    );
}
