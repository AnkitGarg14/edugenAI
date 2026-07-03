import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-sm hover:shadow-md focus:ring-primary",
    secondary: "bg-white hover:bg-slate-50 text-text-primary border border-border shadow-sm focus:ring-slate-200",
    danger: "bg-danger hover:bg-red-600 text-white shadow-sm hover:shadow-md focus:ring-danger",
    ghost: "hover:bg-slate-100 text-text-secondary hover:text-text-primary focus:ring-slate-200"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
