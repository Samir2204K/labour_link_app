import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, ArrowRight, MessageSquare } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { StatCard, DashboardWidget } from '../components/DashboardUI';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../api/bookingService';
import { chatService } from '../api/chatService';
import { useToast } from '../context/ToastContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatWorker, setChatWorker] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, chatsData] = await Promise.all([
          bookingService.getMyBookings(),
          chatService.getRecentChats(user.email)
        ]);
        
        setBookings(bookingsData);
        
        // Fetch full info for each chat partner
        const partnersInfo = await Promise.all(
          chatsData.map(email => chatService.getPartnerInfo(email))
        );
        setRecentChats(partnersInfo);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        showToast("Failed to load dashboard data", "error");
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user?.email]);

  const handleCancel = async (id) => {
    try {
        await bookingService.updateBookingStatus(id, 'CANCELLED');
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
        showToast("Booking cancelled successfully", "success");
    } catch (error) {
        showToast("Failed to cancel booking", "error");
    }
  };
  
  const activeBookings = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const completedServices = bookings.filter(b => b.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      <SectionHeader 
        title={`Welcome back, ${user?.name}! 👋`} 
        subtitle="Here's what's happening with your service requests."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Clock} label="Active Bookings" value={activeBookings} color="orange" />
        <StatCard icon={CheckCircle2} label="Services Done" value={completedServices} color="green" />
        <StatCard icon={ArrowRight} label="Total Bookings" value={bookings.length} color="accent" />
      </div>

      <div className="bg-accent rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-accent/20">
        <div>
          <h2 className="text-2xl font-bold mb-2">Need something fixed today?</h2>
          <p className="opacity-80">Browse top-rated professionals in your area and get it done.</p>
        </div>
        <Button variant="secondary" className="bg-white text-accent hover:bg-gray-50 border-none px-8 py-4 text-lg" onClick={() => window.location.href='/workers'}>
          Book New Service
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardWidget title="Current Bookings">
          {loading ? (
              <div className="flex justify-center py-10"><div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                      {booking.worker.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{booking.worker.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{booking.category} • Scheduled: {booking.scheduledDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      booking.status === 'CONFIRMED' ? 'success' : 
                      booking.status === 'PENDING' ? 'warning' : 
                      booking.status === 'COMPLETED' ? 'accent' : 'error'
                    }>
                      {booking.status}
                    </Badge>
                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <Button variant="ghost" size="sm" className="text-accent hover:bg-accent/5 p-2" onClick={() => {
                        console.log("Setting chat worker:", booking.worker);
                        setChatWorker(booking.worker);
                      }}>
                          <MessageSquare size={18} />
                      </Button>
                    )}
                    {booking.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">No active bookings found.</p>
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Recent Messages">
          {loading ? (
            <div className="flex justify-center py-10"><div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : recentChats.length > 0 ? (
            <div className="space-y-4">
              {recentChats.map(partner => (
                <div key={partner.email} className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={partner.image} className="size-10 rounded-full border border-gray-200" alt="" />
                    <div>
                      <h4 className="font-bold text-gray-900">{partner.name}</h4>
                      <p className="text-xs text-gray-500">{partner.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-accent font-bold" onClick={() => setChatWorker(partner)}>
                    Open Chat
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <MessageSquare className="mx-auto mb-2 opacity-20" size={32} />
              <p>No recent messages.</p>
            </div>
          )}
        </DashboardWidget>
      </div>

      {chatWorker && (
        <ChatWindow 
          receiver={chatWorker} 
          onClose={() => setChatWorker(null)} 
        />
      )}
    </div>
  );
}
