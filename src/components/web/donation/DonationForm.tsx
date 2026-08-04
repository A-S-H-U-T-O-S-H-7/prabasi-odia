"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Heart, User, Mail, Phone, MapPin,
  IndianRupee, Loader2, Shield 
} from 'lucide-react';
import { useLocationData } from '@/hooks/useLocationData';

interface DonationFormProps {
  donorType?: 'indian' | 'foreign';
  setDonorType?: (type: 'indian' | 'foreign') => void;
}

export default function DonationForm({ donorType = 'indian', setDonorType }: DonationFormProps) {
  const [localDonorType, setLocalDonorType] = useState<'indian' | 'foreign'>('indian');
  const [processing, setProcessing] = useState(false);
  
  const currentDonorType = donorType || localDonorType;
  const currentSetDonorType = setDonorType || setLocalDonorType;

  const [formData, setFormData] = useState({
    amount: '',
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    city: '',
    pincode: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { countries, states, cities, loading } = useLocationData({
    country: formData.country,
    state: formData.state
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    
    if (name === 'country') {
      updatedData = { ...updatedData, state: '', city: '' };
    } else if (name === 'state') {
      updatedData = { ...updatedData, city: '' };
    }
    
    setFormData(updatedData);
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNumericInputChange = (name: 'mobile' | 'pincode', value: string, maxLength: number) => {
    const numericValue = value.replace(/\D/g, '').slice(0, maxLength);
    setFormData(prev => ({ ...prev, [name]: numericValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const fieldErrors: Record<string, string> = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      fieldErrors.amount = 'Please enter a valid donation amount';
    }
    
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      fieldErrors.fullName = 'Please enter your full name';
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      fieldErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.mobile || !/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ''))) {
      fieldErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    if (!formData.address || formData.address.trim().length < 10) {
      fieldErrors.address = 'Please enter a complete address';
    }
    
    if (!formData.country) {
      fieldErrors.country = 'Please select your country';
    }
    
    if (!formData.state) {
      fieldErrors.state = 'Please select your state';
    }
    
    if (!formData.city) {
      fieldErrors.city = 'Please select your city';
    }
    
    if (!formData.pincode || !/^[0-9]{6}$/.test(formData.pincode)) {
      fieldErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    return fieldErrors;
  };

  const handleSubmit = async () => {
    if (processing) return;
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    setErrors({});
    setProcessing(true);
    
    try {
      // Create donation record
      const donationId = await createDonationRecord();
      await initiatePayment(donationId);
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to process donation. Please try again.');
      setProcessing(false);
    }
  };

  const createDonationRecord = async () => {
    const donationId = 'DN' + Date.now();
    
    try {
      const { db } = await import('@/lib/firebase/config');
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      
      const donationRef = doc(db, 'donations', donationId);
      
      await setDoc(donationRef, {
        id: donationId,
        donationId,
        userId: null,
        donorDetails: {
          name: formData.fullName,
          email: formData.email,
          mobile: formData.mobile.replace(/\D/g, ''),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
          donorType: currentDonorType
        },
        amount: parseFloat(formData.amount),
        currency: 'INR',
        status: 'pending_payment',
        paymentGateway: 'ccavenue',
        purpose: 'donation',
        donorType: currentDonorType,
        taxExemption: {
          eligible: true,
          section: '80G',
          certificateRequired: true
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiryTime: new Date(Date.now() + 15 * 60 * 1000)
      });
      
      return donationId;
    } catch (error) {
      console.error('Donation creation failed:', error);
      throw new Error('Failed to create donation record');
    }
  };

  const initiatePayment = async (donationId: string) => {
    try {
      const paymentData = {
        order_id: donationId,
        purpose: 'donation',
        amount: parseFloat(formData.amount),
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobile.replace(/\D/g, ''),
        address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.pincode}`,
        donor_type: currentDonorType,
        country: formData.country || 'india'
      };
      
      const response = await fetch('/api/payment/ccavenue-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.status) {
        throw new Error(data.errors?.join(', ') || 'Payment request failed');
      }
      
      if (!data.encRequest || !data.access_code) {
        throw new Error('Invalid response from payment API');
      }
      
      submitToCCAvenue(data.encRequest, data.access_code);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw error;
    }
  };

  const submitToCCAvenue = (encRequest: string, accessCode: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction';
    form.target = '_self';
    form.style.display = 'none';
    
    const encInput = document.createElement('input');
    encInput.type = 'hidden';
    encInput.name = 'encRequest';
    encInput.value = encRequest;
    form.appendChild(encInput);
    
    const accInput = document.createElement('input');
    accInput.type = 'hidden';
    accInput.name = 'access_code';
    accInput.value = accessCode;
    form.appendChild(accInput);
    
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg p-4 md:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-[#D9772B]" />
        <h2 className="text-xl font-bold text-[#2A1636]">Make a Difference</h2>
      </div>

      <div className="space-y-4">
        {/* Donor Type and Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Donor Type
            </label>
            <select
              value={currentDonorType}
              onChange={(e) => currentSetDonorType(e.target.value as 'indian' | 'foreign')}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D4C8C0]/50 bg-white/50 focus:border-[#6B1E5B] focus:ring-2 focus:ring-[#6B1E5B]/20 outline-none text-[#2A1636] text-sm transition-all"
            >
              <option value="indian">Indian Donors</option>
              <option value="foreign">NRI/Foreign Donors</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Donation Amount (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm transition-all ${
                  errors.amount ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
                }`}
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm transition-all ${
                errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
            />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* Email and Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm transition-all ${
                  errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5E5A]/40" />
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                placeholder="10-digit number"
                maxLength={10}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm transition-all ${
                  errors.mobile ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
                }`}
                onChange={(e) => handleNumericInputChange('mobile', e.target.value, 10)}
              />
            </div>
            {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#6B5E5A]/40" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter your complete address"
              rows={2}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm resize-none transition-all ${
                errors.address ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
            />
          </div>
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] text-sm appearance-none transition-all ${
                errors.country ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              disabled={loading.countries}
            >
              <option value="">Select</option>
              {countries.map((country) => (
                <option key={country.iso2} value={country.name}>{country.name}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              State
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] text-sm appearance-none transition-all ${
                errors.state ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              disabled={!states.length || loading.states}
            >
              <option value="">Select</option>
              {states.map((state) => (
                <option key={state.iso2} value={state.name}>{state.name}</option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              City
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] text-sm appearance-none transition-all ${
                errors.city ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              disabled={!cities.length || loading.cities}
            >
              <option value="">Select</option>
              {cities.map((city) => (
                <option key={city.id} value={city.name}>{city.name}</option>
              ))}
            </select>
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#2A1636] mb-1.5">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              placeholder="6-digit"
              maxLength={6}
              className={`w-full px-3 py-2.5 rounded-xl border bg-white/50 focus:ring-2 outline-none text-[#2A1636] placeholder:text-[#6B5E5A]/30 text-sm transition-all ${
                errors.pincode ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-[#D4C8C0]/50 focus:border-[#6B1E5B] focus:ring-[#6B1E5B]/20'
              }`}
              onChange={(e) => handleNumericInputChange('pincode', e.target.value, 6)}
            />
            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={processing}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6B1E5B] via-[#8A2E72] to-[#D9772B] text-white font-semibold shadow-lg shadow-[#6B1E5B]/25 hover:shadow-[#6B1E5B]/40 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5" fill="currentColor" />
              Donate Now
            </>
          )}
        </button>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#6B5E5A]">
          <Shield className="w-4 h-4 text-[#6B1E5B]" />
          <span>100% Secure • 80G Tax Exemption • Transparent</span>
        </div>
      </div>
    </motion.div>
  );
}
