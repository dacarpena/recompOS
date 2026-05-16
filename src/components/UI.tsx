import React from 'react';
import { Traffic } from '../types';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

export function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`btn btn-${variant} ${className}`.trim()} {...props}>{children}</button>;
}

export function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input ${className}`.trim()} {...props} />;
}

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function Pill(props: React.ComponentProps<typeof Badge>) { return <Badge {...props} />; }

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

export function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty"><strong>{title}</strong><span>{body}</span></div>;
}

export function Empty(props: React.ComponentProps<typeof EmptyState>) { return <EmptyState {...props} />; }

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
