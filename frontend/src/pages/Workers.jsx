import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, MapPin, SlidersHorizontal, ChevronDown, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { bookingService } from '../api/bookingService';
import { SectionHeader, Button, Input } from '../components/UI';
import { WorkerCard } from '../components/WorkerCard';
import ChatWindow from '../components/ChatWindow';
import MapComponent from '../components/MapComponent';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function Workers() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [chatWorker, setChatWorker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory, userLocation]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let url = `/workers?category=${encodeURIComponent(selectedCategory)}`;
      if (userLocation) {
        url = `/workers/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`;
      }
      const response = await api.get(url);
      setWorkers(userLocation ? response.data : (response.data.content || []));
    } catch (error) {
      console.error("Failed to fetch workers", error);
      showToast("Failed to load workers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }

    showToast("Requesting location access...", "info");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(loc);
        setShowMap(true);
        showToast("Location updated! Showing nearby workers.", "success");
        
        // Optionally send to backend
        api.post('/location', loc).catch(e => console.error("Failed to send loc to backend", e));
      },
      (error) => {
        let msg = "Failed to get location";
        if (error.code === 1) msg = "Location access denied. Please enable it in browser settings.";
        showToast(msg, "error");
      }
    );
  };

  const handleBook = async (worker) => {
    if (!user) {
        showToast("Please login to book a service", "error");
        return;
    }

    const performBooking = async (lat, lng) => {
        try {
            await bookingService.createBooking({
                workerId: worker.id,
                category: worker.category,
                date: new Date().toISOString().split('T')[0],
                latitude: lat,
                longitude: lng
            });
            showToast(`Booking request sent to ${worker.name}!`, 'success');
        } catch (error) {
            console.error("Booking failed", error);
            showToast("Failed to create booking", "error");
        }
    };

    if (!userLocation) {
        showToast("Accessing your location for booking...", "info");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setUserLocation({ lat, lng });
                performBooking(lat, lng);
            },
            (error) => {
                console.error("Location error:", error);
                let msg = "Location access required for booking.";
                if (error.code === 1) msg = "Please enable location access in your browser to book.";
                if (error.code === 3) msg = "Location request timed out. Please try again.";
                showToast(msg, "error");
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        performBooking(userLocation.lat, userLocation.lng);
    }
  };

  const handleChat = (worker) => {
    if (!user) {
      showToast("Please login to chat with professionals", "error");
      return;
    }
    setChatWorker(worker);
  };

  const filteredWorkers = workers.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bgLight pt-28 pb-20 px-5 lg:px-20">
      <SectionHeader 
        title="Find Professionals" 
        subtitle="Browse and book top-rated verified workers nearby."
      >
        <div className="flex items-center gap-3">
            <Button 
              variant={userLocation ? "accent" : "secondary"} 
              className="flex items-center gap-2"
              onClick={handleLocate}
            >
                <Navigation size={18} />
                {userLocation ? "Location On" : "Find Near Me"}
            </Button>
            <Button 
              variant="outline" 
              className="hidden md:flex items-center gap-2"
              onClick={() => setShowMap(!showMap)}
            >
                <MapPin size={18} />
                {showMap ? "Hide Map" : "Show Map"}
            </Button>
        </div>
      </SectionHeader>

      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <MapComponent 
              userLocation={userLocation} 
              workers={workers} 
              onWorkerSelect={(w) => {
                const element = document.getElementById(`worker-${w.id}`);
                if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-32">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-accent" /> Filters
              </h3>
              <button onClick={() => {setSelectedCategory(''); setSearchQuery(''); setUserLocation(null);}} className="text-xs font-bold text-accent hover:underline">Reset</button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name/skill..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 outline-none focus:border-accent text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Categories</label>
                <div className="space-y-2">
                  {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaning', 'AC Repair'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="category" 
                        className="size-4 accent-accent" 
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                      />
                      <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? 'text-accent font-bold' : 'text-gray-500 group-hover:text-gray-700'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Workers Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-500 font-medium">
                  {userLocation ? 'Showing nearby workers' : 'Showing all professionals'} 
                  <span className="text-gray-900 font-bold ml-2">({filteredWorkers.length})</span>
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer">
                    Sort by: <span className="text-accent">{userLocation ? 'Distance' : 'Popularity'}</span> <ChevronDown size={16} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredWorkers.map(worker => (
                    <div id={`worker-${worker.id}`} key={worker.id}>
                      <WorkerCard 
                        worker={worker} 
                        onBook={handleBook}
                        onChat={handleChat}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              {chatWorker && (
                <ChatWindow 
                  receiver={chatWorker} 
                  onClose={() => setChatWorker(null)} 
                />
              )}

              {filteredWorkers.length === 0 && (
                <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                  <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <Search size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No professionals found</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">Try adjusting your filters or search query to find what you're looking for.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
