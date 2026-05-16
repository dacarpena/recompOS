import React from 'react';
import { Info } from 'lucide-react';
import { Traffic } from '../types';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Meter({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meterWrap" aria-label={label}>
      <div className="meter"><div style={{ width: `${pct}%` }} /></div>
      {label && <span className="meterLabel">{label}</span>}
    </div>
  );
}

export function TrafficDot({ status }: { status: Traffic }) {
  return <span className={`dot dot-${status}`} />;
}

export function Empty({ title, body }: { title: string; body: string }) {
  return <div className="empty"><strong>{title}</strong><span>{body}</span></div>;
}

export function Stat({ label, value, hint }: { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>;
}

export function ExplainTooltip({ text }: { text: string }) {
  return <span className="explainTooltip" title={text} aria-label={text}><Info size={13} strokeWidth={2.4} /></span>;
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
