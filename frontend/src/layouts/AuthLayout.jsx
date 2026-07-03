import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex text-white font-sans">
      {/* Left side content/branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface/50 border-r border-white/5 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-900/40 to-background z-0" />
        <div className="z-10 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-accent to-primary-800 bg-clip-text text-transparent mb-6">
            EduGen AI
          </h1>
          <p className="text-xl text-slate-500 max-w-md mx-auto">
            Your personalized AI-powered learning journey begins here. Unlock a new way to learn, tailored specifically for you.
          </p>
        </div>
      </div>
      
      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
         {/* Subtle background glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none" />
         
         <div className="w-full max-w-md z-10 glass-panel p-8">
            {children}
         </div>
      </div>
    </div>
  );
};

export default AuthLayout;
