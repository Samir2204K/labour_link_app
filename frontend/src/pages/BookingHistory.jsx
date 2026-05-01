import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, XCircle, Filter, MessageSquare, MapPin, RefreshCcw } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { DashboardWidget, StatCard } from '../components/DashboardUI';
import { bookingService } from '../api/bookingService';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import { useToast } from '../context/ToastContext';

export default function BookingHistory() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isWorkerView = location.pathname.includes('worker-jobs');

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(isWorkerView ? 'ACTIVE' : 'ALL');
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(Array.isArray(data) ? data : []);
      } catch (error) {
        showToast('Failed to load history', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchBookings();
  }, [user?.email]);

  const filteredBookings = useMemo(() => {
    return bookings
      .slice()
      .sort((a, b) => new Date(b.bookingDate || 0) - new Date(a.bookingDate || 0))
      .filter((booking) => {
        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'PAST') return ['COMPLETED', 'CANCELLED'].includes(booking.status);
        if (statusFilter === 'UPCOMING') return ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status);
        if (statusFilter === 'ACTIVE') return ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status);
        return booking.status === statusFilter;
      });
  }, [bookings, statusFilter]);

  const counts = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((booking) => ['PENDING', 'CONFIRMED', 'ACCEPTED'].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === 'COMPLETED').length,
    cancelled: bookings.filter((booking) => booking.status === 'CANCELLED').length,
  }), [bookings]);

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingService.updateBookingStatus(bookingId, status);
      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? { ...booking, status } : booking
      )));
      showToast(`Booking ${status.toLowerCase()}`, 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update booking', 'error');
    }
  };

  const openChat = (booking) => {
    const otherParty = isWorkerView ? booking.customer : booking.worker;
    setChatUser(otherParty);
  };

  const pageTitle = isWorkerView ? 'My Jobs' : 'Booking History';
  const pageSubtitle = isWorkerView
    ? 'Track requests, active jobs, and completed work in one place.'
    : 'Review your bookings, cancellations, and completed services.';

  return (
    <div className="space-y-8">
      <SectionHeader title={pageTitle} subtitle={pageSubtitle}>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/workers')}>
            <Filter size={16} />
            Find More Workers
          </Button>
          <Button className="flex items-center gap-2" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} />
            Refresh
          </Button>
        </div>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={Calendar} label="Total" value={counts.total} color="accent" />
        <StatCard icon={Clock} label="Active" value={counts.active} color="orange" />
        <StatCard icon={CheckCircle2} label="Completed" value={counts.completed} color="green" />
        <StatCard icon={XCircle} label="Cancelled" value={counts.cancelled} color="cyan" />
      </div>

      <DashboardWidget title="Filters">
        <div className="flex flex-wrap gap-3">
          {[
            ['ALL', 'All'],
            [isWorkerView ? 'ACTIVE' : 'UPCOMING', isWorkerView ? 'Active' : 'Upcoming'],
            ['PAST', 'Past'],
            ['COMPLETED', 'Completed'],
            ['CANCELLED', 'Cancelled'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                statusFilter === value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </DashboardWidget>

      <DashboardWidget title={pageTitle}>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={52} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {isWorkerView
                ? 'New requests and active jobs will appear here once customers start booking you.'
                : 'Your booking history will appear here once you request a service.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const otherParty = isWorkerView ? booking.customer : booking.worker;
              const canCancel = !isWorkerView && booking.status === 'PENDING';
              const canAccept = isWorkerView && booking.status === 'PENDING';
              const canComplete = isWorkerView && ['CONFIRMED', 'ACCEPTED'].includes(booking.status);

              return (
                <div key={booking.id} className="rounded-2xl border border-gray-100 p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <img
                      src={otherParty?.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                      alt={otherParty?.name || 'User'}
                      className="size-14 rounded-2xl object-cover border border-gray-100"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900">{otherParty?.name || 'Unknown'}</h4>
                        <Badge variant={
                          booking.status === 'COMPLETED' ? 'success' :
                          booking.status === 'CANCELLED' ? 'danger' :
                          booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED' ? 'accent' : 'warning'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.category} - Scheduled: {booking.scheduledDate || 'Not set'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Booked on {booking.bookingDate ? new Date(booking.bookingDate).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {booking.latitude && booking.longitude && isWorkerView && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => window.open(`https://www.google.com/maps?q=${booking.latitude},${booking.longitude}`, '_blank')}
                      >
                        <MapPin size={16} />
                        Location
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => openChat(booking)}
                    >
                      <MessageSquare size={16} />
                      Chat
                    </Button>
                    {canCancel && (
                      <Button variant="danger" size="sm" onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}>
                        Cancel
                      </Button>
                    )}
                    {canAccept && (
                      <Button size="sm" onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}>
                        Accept
                      </Button>
                    )}
                    {canComplete && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}>
                        Mark Completed
                      </Button>
                    )}
                    {!isWorkerView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/workers?category=${encodeURIComponent(booking.category || '')}`)}
                      >
                        Book Again
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DashboardWidget>

      {chatUser && (
        <ChatWindow receiver={chatUser} onClose={() => setChatUser(null)} />
      )}
    </div>
  );
}
