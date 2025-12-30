
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-8 py-4 rounded-2xl font-serif italic font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-lg tracking-tight duration-500 select-none';
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] hover:bg-indigo-500 border border-indigo-400/20',
    secondary: 'bg-white text-black hover:bg-gray-100 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.1)] border border-white',
    outline: 'border border-white/10 text-white hover:bg-white/5 backdrop-blur-xl bg-white/5',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/5 text-red-500 border border-red-500/20 hover:bg-red-500/10'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:border-indigo-500/50 focus:bg-white/[0.06] focus:outline-none transition-all text-white placeholder-gray-600 text-sm font-light tracking-wide ${className}`}
    {...props}
  />
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div 
    style={style}
    className={`bg-[#0d0d0f]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <span className={`px-4 py-1.5 rounded-full text-[9px] uppercase tracking-[0.2em] font-black transition-all border ${active ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200' : 'bg-white/5 border-white/5 text-gray-500'}`}>
    {children}
  </span>
);

export const Header: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <div className="flex items-center justify-between px-6 pt-8 pb-4 sticky top-0 bg-[#070708]/90 backdrop-blur-lg z-50 safe-area-top border-b border-white/5">
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all active:scale-90">
          <ChevronLeft size={16} />
        </button>
      )}
      <h1 className="font-serif italic text-xl tracking-tight text-white">{title}</h1>
    </div>
    {rightElement && <div className="flex items-center gap-2">{rightElement}</div>}
  </div>
);
