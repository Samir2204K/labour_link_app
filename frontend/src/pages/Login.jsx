import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Phone, Lock, KeyRound, Mail } from 'lucide-react';
import { Button, Input } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const { login, sendOtp, verifyOtp, resendOtp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      showToast("Logged in successfully!", "success");
      const role = data.user.role.toLowerCase();
      navigate(`/${role}-dashboard`);
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await sendOtp(formData.email);
      if (data?.otp) {
        setFormData(prev => ({ ...prev, otp: data.otp }));
        showToast(`DEV MODE: Code auto-filled: ${data.otp}`, "success");
      } else {
        showToast("Verification code sent to your email!", "success");
      }
      setStep(2);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to send code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOtp(formData.email, formData.otp);
      showToast("Logged in successfully!", "success");
      const role = localStorage.getItem('role');
      navigate(`/${role}-dashboard`);
    } catch (error) {
      showToast(error.response?.data?.message || "Invalid code", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 lg:p-12"
      >
        <div className="text-center mb-10">
          <div className="size-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isOtpMode ? (step === 1 ? "Email Login" : "Verify Code") : "Welcome Back"}
          </h1>
          <p className="text-gray-500">
            {isOtpMode 
              ? (step === 1 ? "Enter your email to receive a code" : "Enter the 6-digit code sent to you")
              : "Login to manage your bookings and profile"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isOtpMode ? (
            <motion.form 
              key="password-login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePasswordLogin} 
              className="space-y-6"
            >
              <Input 
                label="Email Address" 
                type="email"
                placeholder="john@example.com" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                icon={<Mail size={18} />}
              />
              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                icon={<Lock size={18} />}
              />
              <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                {loading ? "Logging in..." : "Login to Account"}
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} 
              className="space-y-6"
            >
              {step === 1 ? (
                <Input 
                  label="Email Address" 
                  type="email"
                  placeholder="john@example.com" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  icon={<Mail size={18} />}
                />
              ) : (
                <Input 
                  label="6-Digit Code" 
                  placeholder="000000" 
                  required 
                  value={formData.otp}
                  onChange={(e) => setFormData({...formData, otp: e.target.value})}
                  icon={<KeyRound size={18} />}
                  maxLength={6}
                />
              )}
              <Button type="submit" className="w-full py-4 text-lg" disabled={loading}>
                {loading ? "Processing..." : (step === 1 ? "Send Code" : "Verify & Login")}
              </Button>
              {step === 2 && (
                <div className="flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-gray-600 font-medium hover:text-accent transition-colors text-sm"
                  >
                    Didn't receive code? <span className="text-accent font-bold">Resend OTP</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-accent font-semibold hover:underline"
                  >
                    Change Email Address
                  </button>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 flex items-center justify-between text-sm font-medium">
          <button 
            onClick={() => {
              setIsOtpMode(!isOtpMode);
              setStep(1);
            }}
            className="text-accent hover:underline flex items-center gap-2"
          >
            {isOtpMode ? <Lock size={16}/> : <KeyRound size={16}/>}
            {isOtpMode ? "Login with Password" : "Login with Code"}
          </button>
        </div>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Don't have an account? <Link to="/register" className="text-accent hover:underline font-bold ml-1">Register now</Link>
        </p>
      </motion.div>
    </div>
  );
}
