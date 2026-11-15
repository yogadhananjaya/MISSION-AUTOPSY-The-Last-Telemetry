/* antislop: Purpose-built technical holographic container for aerospace tactical terminals */
import React from 'react';

interface HoloPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'cyan' | 'amber' | 'emerald' | 'rose';
  children: React.ReactNode;
  className?: string;
}

export const HoloPanel: React.FC<HoloPanelProps> = ({
  title,
  subtitle,
  badge,
  badgeColor = 'cyan',
  children,
  className = '',
  ...props
}) => {
  const badgeClasses = {
    cyan: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    amber: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    emerald: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    rose: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
  }[badgeColor];

  return (
    <div
      className={`relative bg-[#0a1224]/90 border border-cyan-500/35 shadow-[inset_0_0_16px_rgba(34,211,238,0.08)] clip-chamfer-sm overflow-hidden holo-scanlines ${className}`}
      {...props}
    >
      {/* Optional Top Telemetry Header */}
      {(title || badge) && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-cyan-500/20 bg-cyan-950/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            {title && <span className="font-bold text-cyan-300 uppercase tracking-wider">{title}</span>}
            {subtitle && <span className="text-[10px] text-slate-400">/ {subtitle}</span>}
          </div>
          {badge && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 border clip-chamfer-sm ${badgeClasses}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Panel Inner Content */}
      <div className="p-3.5">
        {children}
      </div>
    </div>
  );
};
