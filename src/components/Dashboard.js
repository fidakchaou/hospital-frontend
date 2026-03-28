import React, { useState, useEffect, useRef } from 'react';
import { showToast } from './Toast';

const COLORS = {
  primary: '#14b8a6', primaryDark: '#0f766e',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6',
  text: '#0f172a', textLight: '#64748b', border: '#e2e8f0', white: '#ffffff', bg: '#f0fdf9',
};

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    prev.current = value;
    if (start === value) { setDisplayed(value); return; }
    let step = 0;
    const steps = 20;
    const timer = setInterval(() => {
      step++;
      setDisplayed(Math.round(start + (value - start) * (step / steps)));
      if (step >= steps) { setDisplayed(value); clearInterval(timer); }
    }, 600 / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{displayed}</span>;
}

function SimpleBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', borderRadius: '10px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: '10px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: '700', color, minWidth: '32px' }}>{pct}%</span>
    </div>
  );
}

function StatCard({ label, value, color, lightColor, icon, sublabel, showBar, total }) {
  return (
    <div className="card-enter"
      style={{ backgroundColor: COLORS.white, borderRadius: '20px', padding: '22px', border: `1px solid ${COLORS.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s ease', cursor: 'default' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', backgroundColor: `${color}08` }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `linear-gradient(135deg, ${color}, ${color}cc)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${color}35`, flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icon}</svg>
        </div>
        {showBar && total > 0 && (
          <div style={{ backgroundColor: lightColor, padding: '4px 8px', borderRadius: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color }}>{Math.round((value / total) * 100)}%</span>
          </div>
        )}
      </div>

      <div style={{ fontSize: '34px', fontWeight: '800', color: COLORS.text, lineHeight: 1, marginBottom: '3px', fontVariantNumeric: 'tabular-nums' }}>
        <AnimatedNumber value={value} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.textLight, marginBottom: showBar && total > 0 ? '12px' : '8px' }}>{label}</div>

      {showBar && total > 0 && <SimpleBar value={value} max={total} color={color} />}

      <div style={{ fontSize: '11px', color, marginTop: '6px', fontWeight: '500' }}>{sublabel}</div>
    </div>
  );
}

function SystemHealthIndicator({ pannes, t }) {
  const total = pannes.length;
  const critical = pannes.filter(p => p.priority === 'Élevée' && p.status !== 'Terminée').length;
  const difficult = pannes.filter(p => p.status === 'Difficile').length;
  const inProgress = pannes.filter(p => p.status === 'En cours').length;

  let health = 100;
  if (total > 0) {
    const critPenalty = (critical / total) * 50;
    const diffPenalty = (difficult / total) * 30;
    const inPrgPenalty = (inProgress / total) * 10;
    health = Math.max(0, Math.round(100 - critPenalty - diffPenalty - inPrgPenalty));
  }

  const color = health >= 75 ? COLORS.success : health >= 40 ? COLORS.warning : COLORS.danger;
  const label = health >= 75 ? t.excellent : health >= 40 ? t.fair : t.critical;
  const bgColor = health >= 75 ? '#ecfdf5' : health >= 40 ? '#fffbeb' : '#fef2f2';
  const circumference = 2 * Math.PI * 28;
  const strokeDash = (health / 100) * circumference;

  return (
    <div style={{ backgroundColor: COLORS.white, borderRadius: '16px', padding: '18px 22px', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
        <svg viewBox="0 0 64 64" style={{ width: '64px', height: '64px', transform: 'rotate(-90deg)' }}>
          <circle cx="32" cy="32" r="28" fill="none" stroke="#f1f5f9" strokeWidth="5" />
          <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s ease, stroke 0.5s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color }}>{health}%</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.text, marginBottom: '3px' }}>{t.systemHealth}</div>
        <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '8px' }}>{critical} {t.criticalActive}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {critical > 0 && <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.danger, backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '10px' }}>{critical} {t.critical}</span>}
          {difficult > 0 && <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.warning, backgroundColor: '#fffbeb', padding: '2px 8px', borderRadius: '10px' }}>{difficult} {t.difficiles}</span>}
          {inProgress > 0 && <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.primary, backgroundColor: '#f0fdf9', padding: '2px 8px', borderRadius: '10px' }}>{inProgress} {t.enCours}</span>}
          {total === 0 && <span style={{ fontSize: '11px', fontWeight: '600', color: COLORS.success, backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '10px' }}>{t.excellent}</span>}
        </div>
      </div>
      <div style={{ fontSize: '13px', fontWeight: '700', color, backgroundColor: bgColor, padding: '6px 14px', borderRadius: '20px', border: `1px solid ${color}25`, flexShrink: 0 }}>{label}</div>
    </div>
  );
}

function ActivityTimeline({ pannes, t }) {
  const sorted = [...pannes].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  const getTimeLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today) return t.today;
    if (dateStr === yesterday) return t.yesterday;
    return dateStr;
  };

  const priorityConfig = {
    'Élevée': { color: COLORS.danger, bg: '#fef2f2' },
    'Moyenne': { color: COLORS.warning, bg: '#fffbeb' },
    'Faible': { color: COLORS.success, bg: '#ecfdf5' },
  };

  const statusConfig = {
    'En cours': { color: COLORS.warning, label: t.statusEnCours },
    'Terminée': { color: COLORS.success, label: t.statusTerminee },
    'Difficile': { color: COLORS.danger, label: t.statusDifficile },
  };

  if (sorted.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textLight }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#94a3b8" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.text, marginBottom: '4px' }}>{t.noActivity}</div>
      </div>
    );
  }

  return (
    <div>
      {sorted.map((panne, i) => {
        const pc = priorityConfig[panne.priority] || priorityConfig['Faible'];
        const sc = statusConfig[panne.status] || statusConfig['En cours'];
        return (
          <div key={panne.id} style={{ display: 'flex', gap: '10px', padding: '12px 20px', borderBottom: i < sorted.length - 1 ? `1px solid ${COLORS.border}` : 'none', transition: 'background 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: '4px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pc.color, border: '2px solid white', boxShadow: `0 0 0 3px ${pc.color}25` }} />
              {i < sorted.length - 1 && <div style={{ width: '1px', flex: 1, backgroundColor: COLORS.border, marginTop: '4px', minHeight: '16px' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: COLORS.text }}>{panne.service}</span>
                <span style={{ fontSize: '11px', color: COLORS.textLight, flexShrink: 0, marginLeft: '8px' }}>{getTimeLabel(panne.date)}</span>
              </div>
              <div style={{ fontSize: '12px', color: COLORS.textLight, marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{panne.description}</div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: pc.color, backgroundColor: pc.bg, padding: '2px 7px', borderRadius: '8px' }}>{panne.priority}</span>
                <span style={{ fontSize: '11px', fontWeight: '600', color: sc.color, backgroundColor: `${sc.color}12`, padding: '2px 7px', borderRadius: '8px' }}>{sc.label}</span>
                <span style={{ fontSize: '11px', color: COLORS.textLight, padding: '2px 7px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>{panne.technicien}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PriorityBadge({ priority, t }) {
  const map = {
    'Élevée': { color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', label: t.elevee },
    'Moyenne': { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b', label: t.moyenne },
    'Faible': { color: '#059669', bg: '#ecfdf5', dot: '#10b981', label: t.faible },
  };
  const s = map[priority] || map['Faible'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontSize: '12px', fontWeight: '600' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    'En cours': { color: '#d97706', bg: '#fffbeb', dot: '#f59e0b', label: t.statusEnCours },
    'Terminée': { color: '#059669', bg: '#ecfdf5', dot: '#10b981', label: t.statusTerminee },
    'Difficile': { color: '#dc2626', bg: '#fef2f2', dot: '#ef4444', label: t.statusDifficile },
  };
  const s = map[status] || map['En cours'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontSize: '12px', fontWeight: '600' }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.dot, display: 'inline-block' }} />
      {s.label}
    </span>
  );
}

function Dashboard({ pannes, onAddPanne, setActivePage, t, lang }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newPanne, setNewPanne] = useState({ service: '', description: '', priority: 'Moyenne', technicien: '' });

  const total = pannes.length;
  const inProgress = pannes.filter(p => p.status === 'En cours').length;
  const completed = pannes.filter(p => p.status === 'Terminée').length;
  const difficult = pannes.filter(p => p.status === 'Difficile').length;

  const stats = [
    {
      label: t.totalPannes,
      value: total,
      color: COLORS.primary,
      lightColor: '#f0fdf9',
      showBar: false,
      total: total,
      sublabel: total > 0 ? `${total} ${t.allIncidents}` : t.noPannes,
      icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      label: t.enCours,
      value: inProgress,
      color: COLORS.warning,
      lightColor: '#fffbeb',
      showBar: true,
      total: total,
      sublabel: total > 0 ? `${Math.round((inProgress / total) * 100)}% ${t.activeIncidents}` : t.noPannes,
      icon: <><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" /></>,
    },
    {
      label: t.terminees,
      value: completed,
      color: COLORS.success,
      lightColor: '#ecfdf5',
      showBar: true,
      total: total,
      sublabel: total > 0 ? `${Math.round((completed / total) * 100)}% ${t.resolved}` : t.noPannes,
      icon: <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />,
    },
    {
      label: t.difficiles,
      value: difficult,
      color: COLORS.danger,
      lightColor: '#fef2f2',
      showBar: true,
      total: total,
      sublabel: total > 0 ? `${Math.round((difficult / total) * 100)}% ${t.needAttention}` : t.noPannes,
      icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="white" strokeWidth="2" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round" /></>,
    },
  ];

  const handleAdd = () => {
    if (!newPanne.service || !newPanne.description) {
      showToast(lang === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all required fields', 'error');
      return;
    }
    onAddPanne({
      ...newPanne,
      status: 'En cours',
      technicien: newPanne.technicien || (lang === 'fr' ? 'Non assigné' : 'Not assigned'),
      date: new Date().toISOString().split('T')[0],
    });
    showToast(lang === 'fr' ? 'Panne ajoutée avec succès!' : 'Panne added successfully!', 'success');
    setNewPanne({ service: '', description: '', priority: 'Moyenne', technicien: '' });
    setShowModal(false);
  };

  const filtered = pannes.filter(p =>
    !search ||
    p.service?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.technicien?.toLowerCase().includes(search.toLowerCase())
  );

  const dateStr = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const priorityOptions = [
    { value: 'Faible', label: t.faible, color: COLORS.success, desc: t.lowImpact },
    { value: 'Moyenne', label: t.moyenne, color: COLORS.warning, desc: t.mediumImpact },
    { value: 'Élevée', label: t.elevee, color: COLORS.danger, desc: t.highImpact },
  ];

  return (
    <div className="page-enter" style={{ padding: '28px', backgroundColor: COLORS.bg, minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.5px' }}>{t.dashboard}</h1>
          <p style={{ margin: '4px 0 0', color: COLORS.textLight, fontSize: '14px' }}>{dateStr}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px rgba(5,150,105,0.35)` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
          {t.newPanne}
        </button>
      </div>

      {/* System Health */}
      <div style={{ marginBottom: '20px' }}>
        <SystemHealthIndicator pannes={pannes} t={t} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '22px' }}>
        {stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
          style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', backgroundColor: COLORS.white, color: COLORS.text, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* Recent Pannes */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: COLORS.text }}>{t.recentActivity}</h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.textLight }}>{t.recentActivitySub}</p>
            </div>
            <button onClick={() => setActivePage('pannes')} style={{ backgroundColor: `${COLORS.primary}12`, color: COLORS.primary, border: `1.5px solid ${COLORS.primary}25`, padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              {t.viewAll} →
            </button>
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: COLORS.textLight }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" /></svg>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: COLORS.text, marginBottom: '4px' }}>{t.noPannesFound}</div>
              <div style={{ fontSize: '13px' }}>{t.addFirstPanne}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {[t.id, t.service, t.priority, t.status, t.technicien].map(h => (
                      <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: COLORS.textLight, borderBottom: `1px solid ${COLORS.border}`, textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 5).map(panne => (
                    <tr key={panne.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '13px 18px', fontSize: '12px', fontWeight: '700', color: COLORS.primary, whiteSpace: 'nowrap' }}>{panne.id}</td>
                      <td style={{ padding: '13px 18px', fontSize: '13px', fontWeight: '600', color: COLORS.text, whiteSpace: 'nowrap' }}>{panne.service}</td>
                      <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}><PriorityBadge priority={panne.priority} t={t} /></td>
                      <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}><StatusBadge status={panne.status} t={t} /></td>
                      <td style={{ padding: '13px 18px', fontSize: '12px', color: COLORS.textLight, whiteSpace: 'nowrap' }}>{panne.technicien}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${COLORS.border}` }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: COLORS.text }}>{t.timelineTitle}</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.textLight }}>{t.timelineSub}</p>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
            <ActivityTimeline pannes={pannes} t={t} />
          </div>
        </div>

      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card-enter" style={{ backgroundColor: COLORS.white, borderRadius: '24px', padding: '36px', width: '500px', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: COLORS.text }}>{t.addNewPanne}</h2>
                <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>{t.fillDetails}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textLight, flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            {[
              { label: t.service, key: 'service', placeholder: t.servicePlaceholder },
              { label: t.description, key: 'description', placeholder: t.descriptionPlaceholder, textarea: true },
              { label: t.technicien, key: 'technicien', placeholder: t.technicienPlaceholder },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '7px' }}>{field.label}</label>
                {field.textarea ? (
                  <textarea style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa', resize: 'none', height: '90px', fontFamily: 'inherit', color: COLORS.text }}
                    placeholder={field.placeholder} value={newPanne[field.key]} onChange={e => setNewPanne({ ...newPanne, [field.key]: e.target.value })} />
                ) : (
                  <input style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa', color: COLORS.text, fontFamily: 'inherit' }}
                    placeholder={field.placeholder} value={newPanne[field.key]} onChange={e => setNewPanne({ ...newPanne, [field.key]: e.target.value })} />
                )}
              </div>
            ))}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '10px' }}>{t.priority}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {priorityOptions.map(p => {
                  const selected = newPanne.priority === p.value;
                  return (
                    <button key={p.value} onClick={() => setNewPanne({ ...newPanne, priority: p.value })}
                      style={{ padding: '14px 8px', borderRadius: '14px', border: `2px solid ${selected ? p.color : COLORS.border}`, backgroundColor: selected ? `${p.color}10` : '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: selected ? `${p.color}20` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${selected ? p.color : 'transparent'}` }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: selected ? p.color : '#94a3b8' }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: selected ? p.color : COLORS.textLight }}>{p.label}</span>
                      <span style={{ fontSize: '10px', color: selected ? p.color : '#94a3b8', textAlign: 'center' }}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, color: COLORS.textLight, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{t.cancel}</button>
              <button onClick={handleAdd} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 14px rgba(20,184,166,0.35)` }}>{t.add} →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;