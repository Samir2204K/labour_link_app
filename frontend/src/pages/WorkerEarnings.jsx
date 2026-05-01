import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Briefcase, Clock3, TrendingUp, BadgeCheck } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { DashboardWidget, StatCard } from '../components/DashboardUI';
import { bookingService } from '../api/bookingService';
import { profileService } from '../api/profileService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function WorkerEarnings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingData, profileData] = await Promise.all([
          bookingService.getMyBookings(),
          profileService.getMyProfile(),
        ]);

        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setPrice(profileData.workerProfile?.price || 0);
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load earnings', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchData();
  }, [user?.email]);

  const stats = useMemo(() => {
    const completed = bookings.filter((booking) => booking.status === 'COMPLETED');
    const active = bookings.filter((booking) => ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status));
    const estimated = completed.length * (Number(price) || 0);
    const pendingValue = active.length * (Number(price) || 0);

    return {
      completed: completed.length,
      active: active.length,
      estimated,
      pendingValue,
    };
  }, [bookings, price]);

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Earnings"
        subtitle="Track completed work, estimated payout, and active job value."
      >
        <Badge variant="accent">Worker view</Badge>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={IndianRupee} label="Estimated Earnings" value={`INR ${stats.estimated}`} color="green" />
        <StatCard icon={Briefcase} label="Completed Jobs" value={stats.completed} color="accent" />
        <StatCard icon={Clock3} label="Active Jobs" value={stats.active} color="orange" />
        <StatCard icon={TrendingUp} label="Pending Value" value={`INR ${stats.pendingValue}`} color="cyan" />
      </div>

      <DashboardWidget title="Earnings Snapshot">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-3 mb-3">
                <BadgeCheck className="text-green-600" />
                <h3 className="font-bold text-gray-900">Completed services</h3>
              </div>
              <p className="text-3xl font-bold text-gray-900">INR {stats.estimated}</p>
              <p className="text-sm text-gray-600 mt-2">
                Based on your current hourly rate of INR {price || 0} and completed bookings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">What to do next</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>- Accept jobs faster to improve conversions.</li>
                <li>- Mark completed work on time to keep earnings accurate.</li>
                <li>- Update your profile and availability from settings.</li>
              </ul>
              <div className="mt-5">
                <Button onClick={() => navigate('/worker-profile')}>Update profile</Button>
              </div>
            </div>
          </div>
        )}
      </DashboardWidget>
    </div>
  );
}
