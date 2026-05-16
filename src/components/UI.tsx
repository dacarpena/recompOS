import React from 'react';
import { Traffic } from '../types';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Meter({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const safeMax = max <= 0 ? 100 : max;
  const safeValue = Math.max(0, Math.min(safeMax, value));
  const pct = Math.max(0, Math.min(100, (safeValue / safeMax) * 100));
  const meterLabel = label ?? 'Progreso';
  return (
    <div className="meterWrap">
      <div
        className="meter"
        role="meter"
        aria-label={meterLabel}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
      >
        <div style={{ width: `${pct}%` }} />
      </div>
      <span className="meterLabel">{meterLabel}: {safeValue}/{safeMax}</span>
    </div>
  );
}

export function TrafficDot({ status }: { status: Traffic }) {
  const text = status === 'green' ? 'Verde' : status === 'yellow' ? 'Amarillo' : 'Rojo';
  return <span className="trafficStatus"><span className={`dot dot-${status}`} aria-hidden="true" /> <span>{text}</span></span>;
}

export function Empty({ title, body }: { title: string; body: string }) {
  return <div className="empty"><strong>{title}</strong><span>{body}</span></div>;
}

export function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;
}

export function SectionHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="sectionHeader">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {body && <p>{body}</p>}
    </div>
  );
}
