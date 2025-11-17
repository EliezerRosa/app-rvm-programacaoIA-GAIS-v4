import React from 'react';

interface HeroStat {
    label: string;
    value: string;
    helper?: string;
    trend?: string;
}

interface HeroSummaryProps {
    title: string;
    subtitle: string;
    stats: HeroStat[];
    actionLabel?: string;
    onAction?: () => void;
}

const HeroSummary: React.FC<HeroSummaryProps> = ({ title, subtitle, stats, actionLabel, onAction }) => {
    return (
        <section className="hero-panel">
            <div className="hero-panel__header">
                <div>
                    <p className="hero-panel__eyebrow">Visão geral inteligente</p>
                    <h2 className="hero-panel__title">{title}</h2>
                    <p className="hero-panel__subtitle">{subtitle}</p>
                </div>
                {actionLabel && onAction && (
                    <button onClick={onAction} className="hero-panel__action">{actionLabel}</button>
                )}
            </div>
            <div className="hero-panel__stats">
                {stats.map((stat) => (
                    <article key={stat.label} className="stat-card">
                        <span className="stat-card__label">{stat.label}</span>
                        <div className="stat-card__value">{stat.value}</div>
                        {stat.helper && <p className="stat-card__helper">{stat.helper}</p>}
                        {stat.trend && <span className="stat-card__trend">{stat.trend}</span>}
                    </article>
                ))}
            </div>
        </section>
    );
};

export default HeroSummary;
