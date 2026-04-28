import React, { useState, useEffect } from 'react';
import { Users, Briefcase, BarChart3, TrendingUp, ShieldAlert, Trash2 } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { StatCard, DashboardWidget } from '../components/DashboardUI';
import { adminService } from '../api/adminService';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalWorkers: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch (error) {
        showToast("Failed to fetch stats", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Admin Control Center 👑" 
        subtitle="Overview of platform performance and management."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="accent" />
        <StatCard icon={Briefcase} label="Total Workers" value={stats.totalWorkers} color="orange" />
        <StatCard icon={BarChart3} label="Total Bookings" value={stats.totalBookings} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardWidget title="System Overview">
            <div className="p-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <TrendingUp size={48} className="mx-auto text-accent mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Platform is growing!</h3>
                <p className="text-gray-500">Monitor all activities from the reports section.</p>
                <Button className="mt-6" onClick={() => window.location.href='/admin-reports'}>View Full Reports</Button>
            </div>
        </DashboardWidget>

        <DashboardWidget title="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 group hover:bg-orange-100 transition-all cursor-pointer">
                    <ShieldAlert className="text-orange-500 mb-4" />
                    <h4 className="font-bold text-gray-900">Security Audit</h4>
                    <p className="text-sm text-gray-500">Check system logs and security alerts.</p>
                </div>
                <div className="p-6 rounded-2xl bg-cyan-50 border border-cyan-100 group hover:bg-cyan-100 transition-all cursor-pointer">
                    <Users className="text-cyan-500 mb-4" />
                    <h4 className="font-bold text-gray-900">User Management</h4>
                    <p className="text-sm text-gray-500">Verify and manage platform users.</p>
                </div>
            </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
