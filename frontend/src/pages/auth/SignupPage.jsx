import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError, googleLogin } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    try {
      await dispatch(registerUser({ name: formData.name, email: formData.email, password: formData.password })).unwrap();
      toast.success('Registration successful! Please check your email to verify.');
      navigate('/login');
    } catch (_err) {
      // Error is handled in useEffect via Redux state
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Create Account</h2>
        <p className="text-slate-400">Join EduGen AI to start learning.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <Input 
          label="Full Name" 
          type="text" 
          name="name" 
          placeholder="Enter your name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Email Address" 
          type="email" 
          name="email" 
          placeholder="Enter your email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Password" 
          type="password" 
          name="password" 
          placeholder="Create a password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
        />
        <Input 
          label="Confirm Password" 
          type="password" 
          name="confirmPassword" 
          placeholder="Confirm your password" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          required 
        />
        
        <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">or sign up with</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Sign-up Failed')}
          theme="filled_black"
          shape="circle"
        />
      </div>

      <p className="text-center mt-8 text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-primary-500 font-medium transition-colors">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
