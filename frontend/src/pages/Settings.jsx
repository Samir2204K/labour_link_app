import React, { useEffect, useState } from 'react';
import { Lock, Save, ShieldCheck, UserCog, LogOut, Image as ImageIcon, Briefcase } from 'lucide-react';
import { SectionHeader, Button, Badge, Input } from '../components/UI';
import { DashboardWidget } from '../components/DashboardUI';
import { profileService } from '../api/profileService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const defaultPreferences = {
  bookingAlerts: true,
  chatAlerts: true,
  promoAlerts: false,
  language: 'English',
  serviceRadius: '10',
};

export default function Settings() {
  const { user, role, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    category: '',
    experience: '',
    price: '',
    available: true,
    image: '',
  });

  useEffect(() => {
    const savedPrefs = localStorage.getItem('labourlink_preferences');
    if (savedPrefs) {
      setPreferences((current) => ({ ...current, ...JSON.parse(savedPrefs) }));
    }

    const fetchProfile = async () => {
      try {
        const data = await profileService.getMyProfile();
        const profileUser = data.user || user;
        setForm((current) => ({
          ...current,
          name: profileUser?.name || '',
          mobile: profileUser?.mobile || '',
          category: data.workerProfile?.category || '',
          experience: data.workerProfile?.experience ?? '',
          price: data.workerProfile?.price ?? '',
          available: data.workerProfile?.available ?? true,
          image: data.workerProfile?.image || '',
        }));
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchProfile();
  }, [user?.email]);

  const handlePreferenceChange = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem('labourlink_preferences', JSON.stringify(next));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        currentPassword: form.newPassword ? form.currentPassword : '',
        newPassword: form.newPassword,
      };

      if (role === 'worker') {
        payload.category = form.category;
        payload.experience = form.experience === '' ? null : Number(form.experience);
        payload.price = form.price === '' ? null : Number(form.price);
        payload.available = Boolean(form.available);
        payload.image = form.image;
      }

      await updateProfile(payload);
      showToast('Settings saved successfully', 'success');
      setForm((current) => ({ ...current, currentPassword: '', newPassword: '' }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const roleLabel = role === 'worker' ? 'Worker' : role === 'admin' ? 'Admin' : 'Customer';

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Settings"
        subtitle="Personal details, security, and platform preferences."
      >
        <Badge variant="accent">{roleLabel} account</Badge>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardWidget title="Profile" className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="size-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  icon={<UserCog size={18} />}
                />
                <Input
                  label="Mobile Number"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  icon={<ShieldCheck size={18} />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Current Password"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  icon={<Lock size={18} />}
                  placeholder="Only needed when changing password"
                />
                <Input
                  label="New Password"
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  icon={<Lock size={18} />}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              {role === 'worker' && (
                <div className="space-y-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-900 font-bold">
                    <Briefcase size={18} className="text-accent" />
                    Worker Profile
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50/50"
                      >
                        {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaning', 'AC Repair'].map((category) => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Experience (Years)"
                      type="number"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-5">
                    <Input
                      label="Hourly Price"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                    <Input
                      label="Profile Image URL"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      icon={<ImageIcon size={18} />}
                    />
                  </div>
                  <label className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="size-4 accent-accent"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Available for bookings</p>
                      <p className="text-sm text-gray-500">Turn this off when you are not taking new jobs.</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button variant="outline" type="button" onClick={() => logout()} className="flex items-center gap-2">
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </form>
          )}
        </DashboardWidget>

        <div className="space-y-8">
          <DashboardWidget title="Preferences">
            <div className="space-y-4">
              <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Booking alerts</p>
                  <p className="text-sm text-gray-500">Get notified when a booking changes status.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.bookingAlerts}
                  onChange={(e) => handlePreferenceChange('bookingAlerts', e.target.checked)}
                  className="size-4 accent-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Chat alerts</p>
                  <p className="text-sm text-gray-500">Show notifications for new messages.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.chatAlerts}
                  onChange={(e) => handlePreferenceChange('chatAlerts', e.target.checked)}
                  className="size-4 accent-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900">Promotional emails</p>
                  <p className="text-sm text-gray-500">Optional product and service updates.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.promoAlerts}
                  onChange={(e) => handlePreferenceChange('promoAlerts', e.target.checked)}
                  className="size-4 accent-accent"
                />
              </label>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50/50"
                >
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Marathi</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Service radius preference</label>
                <select
                  value={preferences.serviceRadius}
                  onChange={(e) => handlePreferenceChange('serviceRadius', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-accent bg-gray-50/50"
                >
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                </select>
              </div>
            </div>
          </DashboardWidget>

          <DashboardWidget title="Security">
            <div className="p-5 rounded-2xl bg-accent/5 border border-accent/10">
              <p className="font-semibold text-gray-900 mb-2">Your account is protected with JWT auth.</p>
              <p className="text-sm text-gray-600">
                Change your password from the profile form above. Keep your mobile number current so bookings and messages stay connected.
              </p>
            </div>
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
}
