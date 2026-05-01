import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Trash2, Search, Star, BookmarkCheck } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { DashboardWidget, StatCard } from '../components/DashboardUI';
import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { savedWorkerService } from '../api/savedWorkerService';
import { useToast } from '../context/ToastContext';

export default function SavedWorkers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [chatWorker, setChatWorker] = useState(null);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const data = await savedWorkerService.getSavedWorkers();
        setWorkers(Array.isArray(data) ? data : []);
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load saved workers', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchSaved();
  }, [user?.email]);

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => (
      worker.name.toLowerCase().includes(query.toLowerCase()) ||
      worker.category.toLowerCase().includes(query.toLowerCase())
    ));
  }, [workers, query]);

  const handleRemove = async (workerId) => {
    try {
      await savedWorkerService.removeWorker(workerId);
      setWorkers((current) => current.filter((worker) => worker.id !== workerId));
      showToast('Removed from saved workers', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to remove worker', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Saved Workers"
        subtitle="Keep your favorite professionals one tap away."
      >
        <Button variant="outline" className="flex items-center gap-2" onClick={() => navigate('/workers')}>
          <Heart size={16} />
          Explore more
        </Button>
      </SectionHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={BookmarkCheck} label="Saved Profiles" value={workers.length} color="accent" />
        <StatCard icon={Star} label="Top Rated" value={workers.filter((worker) => (worker.rating || 0) >= 4.5).length} color="green" />
        <StatCard icon={Heart} label="Ready to Book" value={workers.filter((worker) => worker.available !== false).length} color="orange" />
      </div>

      <DashboardWidget title="Search Saved Workers">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or skill..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-accent"
          />
        </div>
      </DashboardWidget>

      <DashboardWidget title="Your Saved Professionals">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="py-16 text-center">
            <Heart className="mx-auto text-gray-300 mb-4" size={52} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No saved workers yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Tap the heart on any worker card to keep them in your saved list.
            </p>
            <Button onClick={() => navigate('/workers')}>Browse workers</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredWorkers.map((worker) => (
              <div key={worker.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-card transition-all">
                <div className="flex items-start gap-4">
                  <img src={worker.image} alt={worker.name} className="size-16 rounded-2xl object-cover border border-gray-100" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{worker.name}</h3>
                        <p className="text-sm text-gray-500">{worker.category}</p>
                      </div>
                      <Badge variant={worker.available ? 'success' : 'warning'}>
                        {worker.available ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      {worker.exp} years experience - INR {worker.price}/hr - {worker.rating} rating
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5">
                  <Button className="flex-1" onClick={() => navigate(`/workers?category=${encodeURIComponent(worker.category || '')}`)}>
                    Book Now
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => setChatWorker(worker)}>
                    <MessageSquare size={16} />
                    Chat
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2 text-red-500" onClick={() => handleRemove(worker.id)}>
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardWidget>

      {chatWorker && (
        <ChatWindow receiver={chatWorker} onClose={() => setChatWorker(null)} />
      )}
    </div>
  );
}
