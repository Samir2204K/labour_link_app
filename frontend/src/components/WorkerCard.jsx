import React from 'react';
import { Star, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge, Button, cn } from './UI';

export const WorkerCard = ({ worker, onBook, onChat, onSave, isSaved }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-card transition-all"
    >
      <button 
        onClick={() => onSave?.(worker)}
        className={cn(
          "absolute top-4 right-4 p-2.5 rounded-full shadow-sm transition-all z-10",
          isSaved ? "bg-red-50 text-red-500" : "bg-white text-gray-300 hover:text-red-400"
        )}
      >
        <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
      </button>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <img src={worker.image} className="size-20 rounded-2xl object-cover ring-4 ring-gray-50" alt={worker.name} />
          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-lg border-2 border-white">
            <ShieldCheck size={14} />
          </div>
        </div>
        <div>
          <Badge variant="accent" className="mb-2">{worker.category}</Badge>
          <h3 className="text-lg font-bold group-hover:text-accent transition-colors">{worker.name}</h3>
          <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
            <Star size={14} fill="currentColor" /> {worker.rating} 
            <span className="text-gray-400 font-medium ml-1">({worker.jobs} bookings)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 mb-6">
        <div className="text-center">
          <p className="text-xs font-bold text-gray-400 uppercase">Experience</p>
          <p className="font-bold text-gray-700">{worker.exp}</p>
        </div>
        <div className="text-center border-l border-gray-100">
          <p className="text-xs font-bold text-gray-400 uppercase">Rate</p>
          <p className="font-bold text-gray-700">₹{worker.price}<span className="text-[10px] text-gray-400">/day</span></p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => onBook?.(worker)} className="flex-1 py-3">
          Book Now
        </Button>
        <Button variant="outline" onClick={() => onChat?.(worker)} className="px-4 py-3 border-accent text-accent hover:bg-accent hover:text-white">
          Chat
        </Button>
      </div>
    </motion.div>
  );
};