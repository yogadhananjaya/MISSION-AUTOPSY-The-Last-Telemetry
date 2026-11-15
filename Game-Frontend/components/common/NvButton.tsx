/* antislop: Purposeful tactile aerospace button component with audible feedback and accessible focus states */
import React from 'react';
import { Loader2 } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface NvButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const NvButton: React.FC<NvButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-amber-400 hover:bg-amber-300 text-black font-extrabold border border-black shadow-[0_2px_8px_rgba(234,179,8,0.25)] hover:shadow-[0_4px_16px_rgba(234,179,8,0.4)]',
    secondary:
      'bg-[#0f172a] hover:bg-[#1e293b] text-cyan-300 hover:text-white border border-cyan-500/50 hover:border-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]',
    danger:
      'bg-red-950/80 hover:bg-red-900 text-rose-200 border border-red-500/60 shadow-[0_2px_8px_rgba(239,68,68,0.2)]',
    ghost:
      'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-transparent hover:border-slate-700',
  }[variant];

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs font-bold gap-2',
    lg: 'px-6 py-3 text-sm font-extrabold gap-2.5',
  }[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (variant === 'danger') {
      sounds.playAlarm();
    } else {
      sounds.playClick(variant === 'primary' ? 850 : 650);
    }
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-mono uppercase tracking-wider clip-chamfer-sm transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/80 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
