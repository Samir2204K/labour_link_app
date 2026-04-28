import React, { useState, useEffect } from 'react';
import { Trash2, User, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import { SectionHeader, Button, Badge } from '../components/UI';
import { DashboardWidget } from '../components/DashboardUI';
import { adminService } from '../api/adminService';
import { useToast } from '../context/ToastContext';

export default function AdminReports() {
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, workersData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllWorkers()
      ]);
      setUsers(usersData);
      setWorkers(workersData);
    } catch (error) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
        showToast("User deleted successfully", "success");
      } catch (error) {
        showToast("Failed to delete user", "error");
      }
    }
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm("Are you sure you want to delete this worker profile?")) {
      try {
        await adminService.deleteWorker(id);
        setWorkers(workers.filter(w => w.id !== id));
        showToast("Worker deleted successfully", "success");
      } catch (error) {
        showToast("Failed to delete worker", "error");
      }
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader 
        title="Reports & Management" 
        subtitle="Manage all users and workers registered on the platform."
      />

      <div className="grid grid-cols-1 gap-8">
        <DashboardWidget title="Registered Users">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-y border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-900">Name</th>
                  <th className="p-4 font-bold text-gray-900">Mobile</th>
                  <th className="p-4 font-bold text-gray-900">Role</th>
                  <th className="p-4 font-bold text-gray-900">Joined On</th>
                  <th className="p-4 font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4 text-gray-600">{user.mobile}</td>
                    <td className="p-4">
                      <Badge variant={user.role === 'ADMIN' ? 'accent' : 'secondary'}>{user.role}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      {user.role !== 'ADMIN' && (
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardWidget>

        <DashboardWidget title="Worker Profiles">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-y border-gray-100">
                <tr>
                  <th className="p-4 font-bold text-gray-900">Worker</th>
                  <th className="p-4 font-bold text-gray-900">Category</th>
                  <th className="p-4 font-bold text-gray-900">Exp</th>
                  <th className="p-4 font-bold text-gray-900">Price</th>
                  <th className="p-4 font-bold text-gray-900">Rating</th>
                  <th className="p-4 font-bold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {workers.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={worker.image} className="size-8 rounded-full object-cover" alt="" />
                        <span className="font-medium">{worker.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{worker.category}</td>
                    <td className="p-4">{worker.exp} Years</td>
                    <td className="p-4">₹{worker.price}</td>
                    <td className="p-4">⭐ {worker.rating}</td>
                    <td className="p-4">
                      <button onClick={() => handleDeleteWorker(worker.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
