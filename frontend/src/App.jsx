import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Users, History, Heart, Settings, Wallet, Briefcase, BarChart3, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy loading for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Workers = lazy(() => import('./pages/Workers'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminReports = lazy(() => import('./pages/AdminReports'));

const Navbar = () => {
  const { user, role } = useAuth();
  return (
    <nav className="fixed top-0 w-full z-50 glass h-20 px-5 lg:px-20 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
        <div className="size-10 bg-accent rounded-lg flex items-center justify-center text-white shadow-lg shadow-accent/20"><ShieldCheck /></div>
        Labour<span className="text-accent">Link</span>
      </Link>
      <div className="hidden md:flex items-center gap-10 font-bold text-gray-600">
        <Link to="/" className="hover:text-accent transition-colors">Home</Link>
        <Link to="/workers" className="hover:text-accent transition-colors">Find Workers</Link>
        <Link to="/register" className="hover:text-accent transition-colors">Join as Partner</Link>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <Link to={`/${role}-dashboard`} className="flex items-center gap-3 p-1.5 pr-4 bg-gray-50 rounded-full border border-gray-100 hover:border-accent/20 transition-all">
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="size-9 rounded-full" alt="" />
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-bold text-accent uppercase leading-tight">{role}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{user.name.split(' ')[0]}</p>
            </div>
          </Link>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="px-6 py-3 text-gray-700 font-bold hover:text-accent transition-all">Login</Link>
            <Link to="/register" className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-gray-800 transition-all">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const Sidebar = () => {
  const { role, logout, user } = useAuth();
  const location = useLocation();
  const currentRole = role?.toLowerCase();
  
  const links = {
    customer: [
      { name: 'Dashboard', path: '/customer-dashboard', icon: LayoutGrid },
      { name: 'History', path: '/customer-history', icon: History },
      { name: 'Saved', path: '/customer-saved', icon: Heart },
      { name: 'Settings', path: '/customer-settings', icon: Settings },
    ],
    worker: [
      { name: 'Dashboard', path: '/worker-dashboard', icon: LayoutGrid },
      { name: 'My Jobs', path: '/worker-jobs', icon: Briefcase },
      { name: 'Earnings', path: '/worker-earnings', icon: Wallet },
      { name: 'Profile', path: '/worker-profile', icon: Users },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutGrid },
      { name: 'Reports', path: '/admin-reports', icon: BarChart3 },
      { name: 'Settings', path: '/admin-settings', icon: Settings },
    ]
  };
  return (
    <aside className="w-72 bg-white border-r border-gray-100 p-8 flex flex-col h-screen fixed z-20">
      <Link to="/" className="mb-10 flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="text-accent" /> Link</Link>
      <div className="mb-8 p-4 bg-accent-light rounded-2xl border border-accent/5">
        <p className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1">Authenticated as</p>
        <p className="font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
      </div>
      <nav className="flex-1 space-y-2">
        {currentRole && links[currentRole]?.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} className={`flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${isActive ? 'bg-accent text-white shadow-xl shadow-accent/20' : 'text-gray-500 hover:bg-gray-50 hover:text-accent'}`}>
              <Icon size={20} strokeWidth={2.5} /><span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
      <button onClick={logout} className="flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all mt-auto"><LogOut size={20} strokeWidth={2.5} /><span>Sign Out</span></button>
    </aside>
  );
};

export default function App() {
  const location = useLocation();
  const isDashboard = location.pathname.includes('-dashboard') || location.pathname.includes('-history') || location.pathname.includes('-jobs') || location.pathname.includes('-reports') || location.pathname.includes('-saved') || location.pathname.includes('-earnings') || location.pathname.includes('-profile') || location.pathname.includes('-settings');
  return (
    <div className={isDashboard ? 'flex' : ''}>
      {isDashboard ? <Sidebar /> : <Navbar />}
      <main className={`flex-1 ${isDashboard ? 'ml-72 p-10 bg-[#f4f7f6] min-h-screen' : ''}`}>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="size-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>}>
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, x: isDashboard ? 20 : 0 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isDashboard ? -20 : 0 }} transition={{ duration: 0.2 }}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/workers" element={<Workers />} />
                <Route path="/customer-dashboard" element={<ProtectedRoute allowedRole="customer"><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/worker-dashboard" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
                <Route path="/admin-dashboard" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin-reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}
