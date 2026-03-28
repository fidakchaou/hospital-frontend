import React, { useState } from 'react';
import Dashboard from './Dashboard';
import Pannes from './Pannes';
import Materiel from './Materiel';
import Users from './Users';
import Rapport from './Rapport';
import translations from './languages';
import { showToast } from './Toast';

const COLORS = {
  primary: '#14b8a6', primaryDark: '#0f766e',
  sidebar: '#0a1f1a', danger: '#ef4444', success: '#10b981',
  warning: '#f59e0b', text: '#0f172a', textLight: '#64748b',
  border: '#e2e8f0', white: '#ffffff', bg: '#f0fdf9',
};

function Layout({ role, pannes, unseenCount, materielNotif, usersNotif, onAddPanne, onDeletePanne, onUpdatePanne, onSeenPannes, onSeenMateriel, onSeenUsers, onNewMateriel, onNewUser, onLogout, lang, setLang }) {
  const [activePage, setActivePage] = useState('dashboard');
  const t = translations[lang];

  const allMenuItems = [
    { key: 'dashboard', label: t.dashboard, roles: ['admin', 'technicien'], icon: <DashboardIcon /> },
    { key: 'pannes', label: t.pannes, roles: ['admin', 'technicien'], icon: <PanneIcon />, notif: unseenCount },
    { key: 'materiel', label: t.materiel, roles: ['admin'], icon: <MaterielIcon />, notif: materielNotif },
    { key: 'users', label: t.users, roles: ['admin'], icon: <UsersIcon />, notif: usersNotif },
    { key: 'rapport', label: t.rapport, roles: ['admin'], icon: <RapportIcon /> },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  const handleNavigate = (key) => {
    if (key === 'pannes') onSeenPannes();
    if (key === 'materiel') onSeenMateriel();
    if (key === 'users') onSeenUsers();
    setActivePage(key);
  };

  const handleLogoutClick = () => {
    showToast(lang === 'fr' ? 'Déconnexion réussie' : 'Logged out successfully', 'info');
    setTimeout(onLogout, 500);
  };

  const renderPage = () => {
    if (role === 'service') return <ServicePage onAddPanne={onAddPanne} t={t} lang={lang} />;
    if (activePage === 'dashboard') return <Dashboard pannes={pannes} onAddPanne={onAddPanne} setActivePage={handleNavigate} t={t} lang={lang} />;
    if (activePage === 'pannes') return <Pannes pannes={pannes} onAddPanne={onAddPanne} onDeletePanne={onDeletePanne} onUpdatePanne={onUpdatePanne} t={t} />;
    if (activePage === 'materiel') return <Materiel t={t} onNewMateriel={onNewMateriel} />;
    if (activePage === 'users') return <Users t={t} onNewUser={onNewUser} />;
    if (activePage === 'rapport') return <Rapport pannes={pannes} t={t} lang={lang} />;
    return <div style={{ padding: '40px' }}><h2>Coming Soon...</h2></div>;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <div style={{ width: '260px', flexShrink: 0, backgroundColor: COLORS.sidebar, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 24px rgba(0,0,0,0.2)' }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(20,184,166,0.4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: '700', fontSize: '11px', lineHeight: '1.4', opacity: 0.9 }}>Taher Sfar Public Hospital</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '1px' }}>IT Management System</div>
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '3px', gap: '3px' }}>
            {['en', 'fr'].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ flex: 1, padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: lang === l ? COLORS.primary : 'transparent', color: lang === l ? 'white' : 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s ease' }}>
                {l === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
              </button>
            ))}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', padding: '8px 12px', marginBottom: '6px' }}>
            {t.mainMenu}
          </div>
          {menuItems.map((item) => {
            const active = activePage === item.key && role !== 'service';
            const notifCount = item.notif || 0;
            return (
              <div key={item.key} onClick={() => handleNavigate(item.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '12px', marginBottom: '3px', cursor: 'pointer', backgroundColor: active ? 'rgba(20,184,166,0.2)' : 'transparent', color: active ? '#5eead4' : 'rgba(255,255,255,0.45)', fontWeight: active ? '600' : '400', fontSize: '14px', borderLeft: active ? '3px solid #14b8a6' : '3px solid transparent', transition: 'all 0.2s ease' }}>
                {item.icon}
                {item.label}
                {notifCount > 0 && (
                  <span style={{ marginLeft: 'auto', backgroundColor: COLORS.danger, color: 'white', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                    {notifCount}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
              {(role || 'A')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>{role || 'Admin'}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Taher Sfar Hospital</div>
            </div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2dd4bf', flexShrink: 0 }} />
          </div>
          <button onClick={handleLogoutClick}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.logout}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: COLORS.bg }}>
        {renderPage()}
      </div>
    </div>
  );
}

function ServicePage({ onAddPanne, t, lang }) {
  const [service, setService] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState('Moyenne');
  const [submitted, setSubmitted] = React.useState(false);

  const TEAL = { primary: '#14b8a6', dark: '#0f766e', light: '#ccfbf1', bg: '#f0fdf9' };

  const handleSubmit = () => {
    if (!service || !description) {
      showToast(lang === 'fr' ? 'Veuillez remplir tous les champs' : 'Please fill all fields', 'error');
      return;
    }
    onAddPanne({ service, description, priority, status: 'En cours', technicien: lang === 'fr' ? 'Non assigné' : 'Not assigned', date: new Date().toISOString().split('T')[0] });
    showToast(lang === 'fr' ? 'Panne signalée avec succès!' : 'Panne reported successfully!', 'success');
    setSubmitted(true);
  };

  const priorityOptions = [
    { value: 'Faible', label: t.faible, color: '#10b981', desc: t.lowImpact, icon: <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
    { value: 'Moyenne', label: t.moyenne, color: '#f59e0b', desc: t.mediumImpact, icon: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { value: 'Élevée', label: t.elevee, color: '#ef4444', desc: t.highImpact, icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
  ];

  if (submitted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: TEAL.bg }}>
        <div className="card-enter" style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '56px 48px', textAlign: 'center', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #ccfbf1' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #14b8a6, #0f766e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(20,184,166,0.3)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{t.submittedTitle}</h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px', lineHeight: '1.5' }}>{t.submittedSubtitle}</p>
          <button onClick={() => { setService(''); setDescription(''); setPriority('Moyenne'); setSubmitted(false); }}
            style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', border: 'none', padding: '13px 32px', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(20,184,166,0.4)' }}>
            {t.reportAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px', backgroundColor: TEAL.bg }}>
      <div className="card-enter" style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '48px', width: '100%', maxWidth: '560px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #ccfbf1' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', boxShadow: '0 4px 14px rgba(20,184,166,0.3)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <h1 style={{ margin: '0 0 6px', fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>{t.declareTitle}</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '15px', lineHeight: '1.5' }}>{t.declareSubtitle}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>{t.service} *</label>
          <input style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #ccfbf1', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f0fdf9', color: '#0f172a', fontFamily: 'inherit' }}
            placeholder={t.servicePlaceholder} value={service} onChange={e => setService(e.target.value)} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>{t.description} *</label>
          <textarea style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid #ccfbf1', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#f0fdf9', resize: 'none', height: '120px', fontFamily: 'inherit', color: '#0f172a' }}
            placeholder={t.descriptionPlaceholder} value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' }}>{t.priority}</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {priorityOptions.map(p => {
              const selected = priority === p.value;
              return (
                <button key={p.value} onClick={() => setPriority(p.value)}
                  style={{ padding: '16px 10px', borderRadius: '14px', border: `2px solid ${selected ? p.color : '#e2e8f0'}`, backgroundColor: selected ? `${p.color}10` : '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: selected ? `${p.color}20` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={selected ? p.color : '#94a3b8'} strokeWidth="2">{p.icon}</svg>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: selected ? p.color : '#64748b' }}>{p.label}</span>
                  <span style={{ fontSize: '10px', color: selected ? p.color : '#94a3b8', textAlign: 'center', fontWeight: '500' }}>{p.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleSubmit}
          style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 20px rgba(20,184,166,0.4)', letterSpacing: '0.3px' }}>
          {t.submitPanne} →
        </button>
      </div>
    </div>
  );
}

function DashboardIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.8" /><rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.8" /><rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.8" /><rect x="14" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.8" /></svg>; }
function PanneIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MaterielIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M8 20h8M12 18v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function UsersIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" /><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }
function RapportIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }

export default Layout; 