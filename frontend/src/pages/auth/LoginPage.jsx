import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, googleLogin, clearError } from '../../redux/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  return (
    <div className="flex flex-col w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
        <p className="text-slate-400">Sign in to continue your learning journey.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
        <Input 
          label="Email Address" 
          type="email" 
          name="email" 
          placeholder="Enter your email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />
        <div className="flex flex-col gap-1">
          <Input 
            label="Password" 
            type="password" 
            name="password" 
            placeholder="Enter your password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>
        
        <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="relative flex items-center py-5">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">or continue with</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google Login Failed')}
          theme="filled_black"
          shape="circle"
        />
      </div>

      <p className="text-center mt-8 text-sm text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="text-accent hover:text-primary-500 font-medium transition-colors">
          Sign up for free
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
