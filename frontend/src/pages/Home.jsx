import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ShieldCheck, ArrowRight, Menu, X, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const services = [
  { id: 'Cleaning', name: 'Cleaning', icon: 'https://cdn-icons-png.flaticon.com/512/995/995053.png' },
  { id: 'AC Repair', name: 'AC & Appliance', icon: 'https://cdn-icons-png.flaticon.com/512/3062/3062331.png' },
  { id: 'Electrician', name: 'Electrician', icon: 'https://cdn-icons-png.flaticon.com/512/6716/6716303.png' },
  { id: 'Plumber', name: 'Plumber', icon: 'https://cdn-icons-png.flaticon.com/512/2954/2954888.png' },
  { id: 'Carpenter', name: 'Carpenter', icon: 'https://cdn-icons-png.flaticon.com/512/1973/1973946.png' },
  { id: 'Painter', name: 'Painting', icon: 'https://cdn-icons-png.flaticon.com/512/937/937517.png' },
];

export default function Home() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-5 lg:px-20 bg-gradient-to-b from-accent-light/30 to-white overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Quality Home Services, <br />
            <span className="text-accent italic">On Demand.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Expert professionals at your doorstep. From cleaning to complex repairs, 
            we've got you covered with verified experts.
          </p>

          <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl shadow-card border border-gray-100 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-100 min-w-[160px]">
              <MapPin className="text-accent size-5" />
              <select className="bg-transparent outline-none font-medium text-gray-700 w-full">
                <option>Nagpur</option>
                <option>Mumbai</option>
                <option>Pune</option>
                <option>Delhi</option>
              </select>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="text-gray-400 size-5" />
              <input 
                type="text" 
                placeholder="Search for services..." 
                className="w-full bg-transparent outline-none py-3 text-lg"
              />
            </div>
            <button className="bg-accent hover:bg-accent-hover text-white p-4 rounded-xl transition-all shadow-lg shadow-accent/20">
              <ArrowRight className="size-6" />
            </button>
          </div>
        </motion.div>
        
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
      </section>

      {/* Services Grid */}
      <section className="py-20 px-5 lg:px-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">What are you looking for?</h2>
            <p className="text-gray-500">Explore our wide range of services</p>
          </div>
          <Link to="/workers" className="text-accent font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {services.map((service, idx) => (
            <motion.div
              key={service.id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/workers?category=${encodeURIComponent(service.id)}`)}
              className="flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-card border border-transparent hover:border-accent/10 transition-all cursor-pointer group"
            >
              <div className="size-16 p-3 bg-white rounded-xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <img src={service.icon} alt={service.name} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-xs font-semibold text-center text-gray-800 leading-tight">
                {service.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-10 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-20 grid md:grid-cols-3 gap-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center">
              <ShieldCheck className="text-accent-light" />
            </div>
            <div>
              <h4 className="font-bold">Verified Professionals</h4>
              <p className="text-sm text-gray-400">Strict background checks</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center">
              <Star className="text-yellow-400" />
            </div>
            <div>
              <h4 className="font-bold">Top Rated Quality</h4>
              <p className="text-sm text-gray-400">4.8/5 avg. service rating</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/10 flex items-center justify-center">
              <MapPin className="text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold">Near You</h4>
              <p className="text-sm text-gray-400">Service across 15+ cities</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
