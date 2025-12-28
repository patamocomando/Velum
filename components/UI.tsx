
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
  const baseStyles = 'px-8 py-5 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-base tracking-tight duration-300';
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(79,70,229,0.4)] hover:bg-indigo-700',
    secondary: 'bg-white text-black hover:bg-gray-100 shadow-2xl scale-100 hover:scale-[1.02]',
    outline: 'border border-white/20 text-white hover:bg-white/10 backdrop-blur-md bg-black/40',
    ghost: 'text-gray-500 hover:text-white',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
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
    className={`w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-indigo-600/50 focus:bg-white/[0.08] focus:outline-none transition-all text-white placeholder-gray-600 text-sm ${className}`}
    {...props}
  />
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ children, className = '', style }) => (
  <div 
    style={style}
    className={`bg-[#0d0d0f] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <span className={`px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.15em] font-black transition-all border ${active ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
    {children}
  </span>
);

export const Header: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <div className="flex items-center justify-between px-8 py-10">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="font-serif italic text-3xl tracking-tight text-white">{title}</h1>
    </div>
    {rightElement && <div className="flex items-center gap-3">{rightElement}</div>}
  </div>
);
