import React, { useState, useEffect } from 'react';
import { Briefcase, Star, IndianRupee, MessageSquare, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { StatCard, DashboardWidget } from '../components/DashboardUI';
import ChatWindow from '../components/ChatWindow';
import UserLocationMap from '../components/UserLocationMap';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../api/bookingService';
import { chatService } from '../api/chatService';
import { useToast } from '../context/ToastContext';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatUser, setChatUser] = useState(null);
  const [selectedBookingForMap, setSelectedBookingForMap] = useState(null);
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

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      showToast(`Booking ${status.toLowerCase()}!`, "success");
    } catch (error) {
      showToast("Failed to update status", "error");
    }
  };

  const pendingRequests = bookings.filter(b => b.status === 'PENDING');
  const activeJobs = bookings.filter(b => b.status === 'CONFIRMED');
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED');

  return (
    <div className="space-y-8 relative">
      <SectionHeader 
        title={`Hello, ${user?.name}! 👋`} 
        subtitle="Manage your job requests and track your performance."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Briefcase} label="Jobs Done" value={completedJobs.length} color="cyan" />
        <StatCard icon={Star} label="Avg Rating" value="4.8" color="orange" />
        <StatCard icon={Clock} label="Active Jobs" value={activeJobs.length} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  <Button size="sm" variant="ghost" className="text-accent font-bold" onClick={() => setChatUser(partner)}>
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

        <DashboardWidget title="New Job Requests">
          {loading ? (
            <div className="flex justify-center py-10"><div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div></div>
          ) : pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">Request from {req.customer.name}</h4>
                    <p className="text-sm text-gray-500">Service: {req.category} • Scheduled: {req.scheduledDate}</p>
                  </div>
                  <div className="flex gap-2">
                    {req.latitude && req.longitude && (
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-accent border-accent/30 p-2" 
                            onClick={() => setSelectedBookingForMap(req)}
                            title="View customer location"
                        >
                            <MapPin size={18} />
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-accent p-2" onClick={() => {
                      setChatUser(req.customer);
                    }}><MessageSquare size={18} /></Button>
                    <Button size="sm" variant="secondary" className="text-red-500" onClick={() => handleStatusUpdate(req.id, 'CANCELLED')}>Reject</Button>
                    <Button size="sm" onClick={() => handleStatusUpdate(req.id, 'CONFIRMED')}>Accept</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              <CheckCircle2 className="mx-auto mb-2" size={32} />
              <p>All caught up! No new requests.</p>
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Active Jobs">
            {activeJobs.length > 0 ? (
                <div className="space-y-4">
                    {activeJobs.map(job => (
                        <div key={job.id} className="p-4 rounded-2xl border border-accent/20 bg-accent/5 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-gray-900">{job.customer.name}</h4>
                                <p className="text-sm text-gray-600">{job.category} • {job.scheduledDate}</p>
                            </div>
                            <div className="flex gap-2">
                                {job.latitude && job.longitude && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="text-accent border-accent/30 p-2" 
                                        onClick={() => setSelectedBookingForMap(job)}
                                        title="View customer location"
                                    >
                                        <MapPin size={18} />
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-accent p-2" onClick={() => {
                                  setChatUser(job.customer);
                                }}><MessageSquare size={18} /></Button>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(job.id, 'COMPLETED')}>Mark Completed</Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-400">
                    <p>No active jobs at the moment.</p>
                </div>
            )}
        </DashboardWidget>
      </div>
      
      {chatUser && (
        <ChatWindow 
          receiver={chatUser} 
          onClose={() => setChatUser(null)} 
        />
      )}

      {selectedBookingForMap && (
        <UserLocationMap 
          customerName={selectedBookingForMap.customer.name}
          latitude={selectedBookingForMap.latitude}
          longitude={selectedBookingForMap.longitude}
          onClose={() => setSelectedBookingForMap(null)}
        />
      )}
    </div>
  );
}
