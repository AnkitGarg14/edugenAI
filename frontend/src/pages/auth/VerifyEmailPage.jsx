import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(res.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };
    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center w-full">
      {status === 'verifying' && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold">Verifying your email...</h2>
          <p className="text-slate-400 mt-2">Please wait a moment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center">
          <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Email Verified!</h2>
          <p className="text-slate-300 mb-8">{message}</p>
          <Link to="/login" className="w-full">
            <Button className="w-full">Continue to Login</Button>
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center">
          <XCircle className="w-20 h-20 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold mb-2">Verification Failed</h2>
          <p className="text-slate-300 mb-8">{message}</p>
          <Link to="/login" className="w-full">
            <Button variant="secondary" className="w-full">Return to Login</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
