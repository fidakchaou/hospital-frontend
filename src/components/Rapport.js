import React from 'react';

const COLORS = {
  primary: '#14b8a6', primaryDark: '#0f766e',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6',
  text: '#0f172a', textLight: '#64748b', border: '#e2e8f0', white: '#ffffff', bg: '#f0fdf9',
};

function ProgressBar({ value, color, animated = true }) {
  return (
    <div style={{ backgroundColor: '#f1f5f9', borderRadius: '10px', height: '8px', width: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(Math.max(value, 0), 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: '10px', height: '8px', transition: animated ? 'width 0.8s cubic-bezier(0.34,1.56,0.64,1)' : 'none' }} />
    </div>
  );
}

function CircularProgress({ value, color, size = 80 }) {
  const r = (size / 2) - 8;
  const circumference = 2 * Math.PI * r;
  const strokeDash = (Math.min(Math.max(value, 0), 100) / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size > 70 ? '15px' : '12px', fontWeight: '800', color }}>{value}%</div>
    </div>
  );
}

function Rapport({ pannes, t, lang }) {
  const total = pannes.length;
  const enCours = pannes.filter(p => p.status === 'En cours').length;
  const terminees = pannes.filter(p => p.status === 'Terminée').length;
  const difficiles = pannes.filter(p => p.status === 'Difficile').length;
  const elevee = pannes.filter(p => p.priority === 'Élevée').length;
  const moyenne = pannes.filter(p => p.priority === 'Moyenne').length;
  const faible = pannes.filter(p => p.priority === 'Faible').length;
  const resolutionRate = total > 0 ? Math.round((terminees / total) * 100) : 0;
  const criticalRate = total > 0 ? Math.round((elevee / total) * 100) : 0;
  const inProgressRate = total > 0 ? Math.round((enCours / total) * 100) : 0;

  const serviceCount = {};
  pannes.forEach(p => { if (p.service) serviceCount[p.service] = (serviceCount[p.service] || 0) + 1; });
  const topServices = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const techCount = {};
  pannes.forEach(p => { if (p.technicien && p.technicien !== 'Not assigned' && p.technicien !== 'Non assigné') techCount[p.technicien] = (techCount[p.technicien] || 0) + 1; });
  const topTech = Object.entries(techCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTech = topTech.length > 0 ? Math.max(...topTech.map(([, c]) => c)) : 1;

  const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  const kpiCards = [
    { label: t.totalPannes, value: total, color: COLORS.primary, bg: '#f0fdf9', icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { label: t.enCours, value: enCours, color: COLORS.warning, bg: '#fffbeb', icon: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { label: t.terminees, value: terminees, color: COLORS.success, bg: '#ecfdf5', icon: <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
    { label: t.difficiles, value: difficiles, color: COLORS.danger, bg: '#fef2f2', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
  ];

  return (
    <div className="page-enter" style={{ padding: '28px', backgroundColor: COLORS.bg, minHeight: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.5px' }}>{t.rapportTitle}</h1>
        <p style={{ margin: '4px 0 0', color: COLORS.textLight, fontSize: '14px' }}>{t.performanceOverview} — {dateStr}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpiCards.map((card, i) => (
          <div key={i} className="card-enter" style={{ backgroundColor: card.bg, borderRadius: '18px', padding: '22px', border: `1px solid ${COLORS.border}`, transition: 'all 0.3s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${card.color}30` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" color={card.color === COLORS.primary ? 'white' : 'white'}>{card.icon}</svg>
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: '800', color: card.color, lineHeight: 1, marginBottom: '4px' }}>{card.value}</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textLight }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Resolution Rate */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: COLORS.text }}>{t.resolutionRate}</h3>
          <CircularProgress value={resolutionRate} color={resolutionRate >= 50 ? COLORS.success : COLORS.danger} size={90} />
          <p style={{ margin: 0, fontSize: '13px', color: COLORS.textLight }}>{t.ofPannesResolved}</p>
        </div>

        {/* Critical Rate */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: COLORS.text }}>{lang === 'fr' ? 'Taux Critique' : 'Critical Rate'}</h3>
          <CircularProgress value={criticalRate} color={criticalRate >= 40 ? COLORS.danger : criticalRate >= 20 ? COLORS.warning : COLORS.success} size={90} />
          <p style={{ margin: 0, fontSize: '13px', color: COLORS.textLight }}>{lang === 'fr' ? 'des pannes à haute priorité' : 'of high priority pannes'}</p>
        </div>

        {/* In Progress Rate */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: COLORS.text }}>{lang === 'fr' ? 'En Progression' : 'In Progress Rate'}</h3>
          <CircularProgress value={inProgressRate} color={COLORS.warning} size={90} />
          <p style={{ margin: 0, fontSize: '13px', color: COLORS.textLight }}>{lang === 'fr' ? 'des pannes en cours' : 'of pannes in progress'}</p>
        </div>

      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

        {/* Priority Breakdown */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: COLORS.text }}>{t.priorityBreakdown}</h3>
          {total === 0 ? (
            <p style={{ color: COLORS.textLight, fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>{t.noData}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: t.elevee, value: elevee, color: COLORS.danger },
                { label: t.moyenne, value: moyenne, color: COLORS.warning },
                { label: t.faible, value: faible, color: COLORS.success },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>{item.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: item.color }}>{item.value}</span>
                      <span style={{ fontSize: '11px', color: COLORS.textLight }}>({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                    </div>
                  </div>
                  <ProgressBar value={total > 0 ? (item.value / total) * 100 : 0} color={item.color} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Services */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: COLORS.text }}>{t.topServices}</h3>
          {topServices.length === 0 ? (
            <p style={{ color: COLORS.textLight, fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>{t.noData}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topServices.map(([service, count], i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: COLORS.primary }}>{i + 1}</div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: COLORS.primary }}>{count}</span>
                  </div>
                  <ProgressBar value={total > 0 ? (count / total) * 100 : 0} color={COLORS.primary} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Techniciens */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '24px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '15px', fontWeight: '700', color: COLORS.text }}>{t.topTechniciens}</h3>
          {topTech.length === 0 ? (
            <p style={{ color: COLORS.textLight, fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>{t.noData}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topTech.map(([tech, count], i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #14b8a6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '12px', flexShrink: 0 }}>{tech[0].toUpperCase()}</div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tech}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: COLORS.purple }}>{count}</span>
                  </div>
                  <ProgressBar value={maxTech > 0 ? (count / maxTech) * 100 : 0} color={COLORS.purple} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Rapport;