import React from 'react';
import { ToothStatus } from '../types';

interface ToothIconProps {
  status: ToothStatus;
  size?: number;
  isSelected?: boolean;
}

const ToothIcon: React.FC<ToothIconProps> = ({
  status,
  size = 32,
  isSelected = false,
}) => {
  // Warna status (stroke/fill)
  const statusColors: Record<ToothStatus, {stroke: string; fill: string}> = {
    [ToothStatus.Healthy]: { stroke: '#2c3e50', fill: '#fff' },
    [ToothStatus.Decay]: { stroke: '#b91c1c', fill: '#fde68a' },
    [ToothStatus.Filled]: { stroke: '#64748b', fill: '#a3a3a3' },
    [ToothStatus.Extracted]: { stroke: '#ef4444', fill: '#e5e7eb' },
    [ToothStatus.RootCanal]: { stroke: '#a78bfa', fill: '#ede9fe' },
    [ToothStatus.Crown]: { stroke: '#f59e42', fill: '#fde68a' },
    [ToothStatus.Missing]: { stroke: '#a3a3a3', fill: '#e5e7eb' },
  };
  const { stroke, fill } = statusColors[status];
  const highlight = isSelected ? '#6366f1' : stroke;

  // Custom SVG from user (Tabler Dental)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={highlight}
      strokeWidth={isSelected ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', borderRadius: 6, boxShadow: isSelected ? '0 0 0 2px #6366f1' : undefined }}
      aria-label={`Tooth status: ${status}`}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 5.5c-1.074 -.586 -2.583 -1.5 -4 -1.5c-2.1 0 -4 1.247 -4 5c0 4.899 1.056 8.41 2.671 10.537c.573 .756 1.97 .521 2.567 -.236c.398 -.505 .819 -1.439 1.262 -2.801c.292 -.771 .892 -1.504 1.5 -1.5c.602 0 1.21 .737 1.5 1.5c.443 1.362 .864 2.295 1.262 2.8c.597 .759 2 .993 2.567 .237c1.615 -2.127 2.671 -5.637 2.671 -10.537c0 -3.74 -1.908 -5 -4 -5c-1.423 0 -2.92 .911 -4 1.5z" />
      <path d="M12 5.5l3 1.5" />
      {/* Status overlays (opsional) */}
      {status === ToothStatus.Filled && (
        <ellipse cx="12" cy="10" rx="2.2" ry="0.8" fill="#64748b" />
      )}
      {status === ToothStatus.Decay && (
        <ellipse cx="12" cy="10" rx="1.7" ry="0.7" fill="#b91c1c" opacity="0.7" />
      )}
      {status === ToothStatus.Crown && (
        <rect x="8.5" y="6.5" width="7" height="2" rx="1" fill="#fde68a" stroke="#f59e42" strokeWidth="0.5" />
      )}
      {status === ToothStatus.RootCanal && (
        <rect x="11.2" y="7.5" width="1.6" height="6" fill="#a78bfa" rx="0.5" />
      )}
      {(status === ToothStatus.Extracted || status === ToothStatus.Missing) && (
        <g>
          <line x1="6" y1="6" x2="18" y2="18" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="18" y1="6" x2="6" y2="18" stroke="#ef4444" strokeWidth="1.5" />
        </g>
      )}
    </svg>
  );
};

export default ToothIcon;
