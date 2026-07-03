import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { password, ...rest } = formData;
      const dataToSubmit = password ? formData : rest; // Only send password if updating
      
      await api.put('/auth/profile', dataToSubmit);
      toast.success('Profile updated successfully');
      // Update local state if needed or re-fetch profile
      dispatch(getProfile());
      setFormData(prev => ({ ...prev, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="glass-panel p-8 bg-white border border-border rounded-2xl shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shadow-md border-4 border-white">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-text-primary">{user.name}</h2>
            <p className="text-text-secondary capitalize">{user.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
            />
            <Input 
              label="Email Address" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              disabled={!!user.googleId} // Disable if signed in with Google
            />
          </div>
          
          <div className="border-t border-white/10 pt-6 mt-2">
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <Input 
              label="New Password" 
              name="password" 
              type="password" 
              placeholder="Leave blank to keep current" 
              value={formData.password} 
              onChange={handleChange} 
              disabled={!!user.googleId} // Disable password change for google users
            />
            {user.googleId && (
              <p className="text-sm text-amber-500 mt-2">Password changes are disabled for Google accounts.</p>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
