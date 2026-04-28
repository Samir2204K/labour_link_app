import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HardHat, Users } from 'lucide-react';
import { Button, Input, cn } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    fullname: '',
    mobile: '',
    email: '',
    password: '',
    category: '',
    experience: '',
    price: '',
    otpCode: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { sendOtpForRegistration, resendOtp } = useAuth();
  const { showToast } = useToast();

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await resendOtp(formData.email);
      showToast("OTP resent successfully!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to resend OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      showToast("Please enter a valid email address", "error");
      return;
    }
    if (!formData.fullname || !formData.mobile || !formData.password) {
      showToast("Please fill in all basic details first", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        fullname: formData.fullname,
        mobile: formData.mobile,
        email: formData.email,
        password: formData.password,
        role: role,
        category: role === 'WORKER' ? formData.category : null,
        experience: role === 'WORKER' ? parseInt(formData.experience) : null,
        price: role === 'WORKER' ? parseFloat(formData.price) : null
      };
      await api.post('/auth/register', payload);
      setOtpSent(true);
      showToast("Verification code sent to your email!", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to initiate registration", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otpSent) {
      showToast("Please verify your email with the code first", "error");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      // Step: Verify OTP and Complete Registration (User was created in handleSendOtp)
      const verifyResponse = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otpCode
      });

      const { token, user } = verifyResponse.data;
      
      const normalizedRole = user.role.toLowerCase();
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', normalizedRole);
      
      showToast("Registration successful!", "success");
      navigate(`/${normalizedRole}-dashboard`);
    } catch (error) {
      console.error("Registration failed", error);
      showToast(error.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-6 pt-24">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-card p-8 lg:p-12"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join the largest service network in Nagpur</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole('WORKER')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              role === 'WORKER' ? "bg-white text-accent shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <HardHat size={20} /> I want Work
          </button>
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all",
              role === 'CUSTOMER' ? "bg-white text-accent shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Users size={20} /> I want to Hire
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            required 
            value={formData.fullname}
            onChange={(e) => setFormData({...formData, fullname: e.target.value})}
          />
          
          <div className="relative">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="john@example.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={otpSent}
            />
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="absolute right-2 bottom-2 bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-accent/90 disabled:bg-gray-400 transition-colors"
              >
                {loading ? "..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="absolute right-2 bottom-2 text-accent text-sm font-bold hover:underline disabled:text-gray-400 transition-colors"
              >
                {loading ? "..." : "Resend OTP"}
              </button>
            )}
          </div>

          <AnimatePresence mode='wait'>
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Input 
                  label="Verification Code" 
                  placeholder="000000" 
                  required 
                  maxLength={6}
                  value={formData.otpCode}
                  onChange={(e) => setFormData({...formData, otpCode: e.target.value})}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Input 
            label="Mobile Number" 
            type="tel" 
            placeholder="9876543210" 
            required 
            pattern="[0-9]{10}"
            value={formData.mobile}
            onChange={(e) => setFormData({...formData, mobile: e.target.value})}
          />

          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          {role === 'WORKER' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Category</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:border-accent focus:ring-4 focus:ring-accent/5 transition-all appearance-none cursor-pointer"
                  required={role === 'WORKER'} 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaning', 'AC Repair'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Experience (Years)" 
                  type="number" 
                  placeholder="5" 
                  required={role === 'WORKER'} 
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
                <Input 
                  label="Hourly Price (₹)" 
                  type="number" 
                  placeholder="500" 
                  required={role === 'WORKER'} 
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </motion.div>
          )}

          <Button type="submit" className="w-full py-4 text-lg mt-4">
            Create Account
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-accent hover:underline font-bold ml-1">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}
