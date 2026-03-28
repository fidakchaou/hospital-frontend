import React, { useState, useEffect } from 'react';
import { showToast } from './Toast';

const COLORS = {
  primary: '#14b8a6', primaryDark: '#0f766e',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6',
  text: '#0f172a', textLight: '#64748b', border: '#e2e8f0', white: '#ffffff', bg: '#f0fdf9',
};

function generateUserId(list) {
  if (list.length === 0) return 'U-001';
  const nums = list.map(u => parseInt(u.id.replace('U-', ''))).filter(n => !isNaN(n));
  if (nums.length === 0) return 'U-001';
  return `U-${String(Math.max(...nums) + 1).padStart(3, '0')}`;
}

const roleColors = {
  admin: { color: COLORS.purple, bg: '#f5f3ff', border: '#ddd6fe' },
  technicien: { color: COLORS.primary, bg: '#f0fdf9', border: '#c7d2fe' },
  service: { color: COLORS.success, bg: '#ecfdf5', border: '#a7f3d0' },
};

const roleAvatarColors = {
  admin: 'linear-gradient(135deg, #e75cf6, #14b8a6)',
  technicien: 'linear-gradient(135deg, #14b8a6, #0f766e)',
  service: 'linear-gradient(135deg, #10b989, #969605)',
};

function Users({ t, onNewUser }) {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [search, setSearch] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'technicien' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('users_v2');
      if (saved) setUsers(JSON.parse(saved));
    } catch { setUsers([]); }
  }, []);

  const saveUsers = (data) => {
    setUsers(data);
    localStorage.setItem('users_v2', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) {
      showToast(t.cancel === 'Cancel' ? 'Please fill all fields' : 'Veuillez remplir tous les champs', 'error');
      return;
    }
    const id = generateUserId(users);
    const user = { id, name: newUser.name, email: newUser.email, role: newUser.role, status: 'Active', joined: new Date().toISOString().split('T')[0] };
    saveUsers([user, ...users]);
    if (onNewUser) onNewUser();
    showToast(t.cancel === 'Cancel' ? 'User added successfully!' : 'Utilisateur ajouté avec succès!', 'success');
    setNewUser({ name: '', email: '', role: 'technicien' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(t.cancel === 'Cancel' ? 'Are you sure?' : 'Êtes-vous sûr?')) {
      saveUsers(users.filter(u => u.id !== id));
      showToast(t.cancel === 'Cancel' ? 'User deleted' : 'Utilisateur supprimé', 'info');
    }
  };

  const handleToggle = (id) => {
    const updated = users.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u);
    saveUsers(updated);
    showToast(t.cancel === 'Cancel' ? 'Status updated' : 'Statut mis à jour', 'success');
  };

  const filtered = users
    .filter(u => filterRole === 'All' || u.role === filterRole)
    .filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.role?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-enter" style={{ padding: '28px', backgroundColor: COLORS.bg, minHeight: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.5px' }}>{t.users}</h1>
          <p style={{ margin: '4px 0 0', color: COLORS.textLight, fontSize: '14px' }}>{users.length} {t.totalUsers}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px rgba(99,102,241,0.35)` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
          {t.addUser}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '22px' }}>
        {[
          { label: t.admins, value: users.filter(u => u.role === 'admin').length, color: COLORS.purple, bg: '#f5f3ff' },
          { label: t.techniciens, value: users.filter(u => u.role === 'technicien').length, color: COLORS.primary, bg: '#f0fdf9' },
          { label: t.services, value: users.filter(u => u.role === 'service').length, color: COLORS.success, bg: '#ecfdf5' },
        ].map((s, i) => (
          <div key={i} className="card-enter" style={{ backgroundColor: s.bg, borderRadius: '16px', padding: '20px 22px', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke={s.color} strokeWidth="2" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={s.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: COLORS.textLight, marginTop: '2px', fontWeight: '500' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', backgroundColor: COLORS.white, color: COLORS.text, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'admin', 'technicien', 'service'].map(f => (
            <button key={f} onClick={() => setFilterRole(f)} style={{ padding: '10px 16px', borderRadius: '10px', border: `1.5px solid ${filterRole === f ? COLORS.primary : COLORS.border}`, cursor: 'pointer', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', backgroundColor: filterRole === f ? `${COLORS.primary}10` : COLORS.white, color: filterRole === f ? COLORS.primary : COLORS.textLight, whiteSpace: 'nowrap' }}>
              {f === 'All' ? t.filterAll : f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '72px', textAlign: 'center', color: COLORS.textLight }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#94a3b8" strokeWidth="2" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: COLORS.text, marginBottom: '8px' }}>{t.noUsers}</div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>{t.addFirstUser}</div>
            <button onClick={() => setShowModal(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', padding: '11px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {t.addUser}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {[t.id, t.name, t.email, t.role, t.status, t.joined, t.actions].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: COLORS.textLight, borderBottom: `1px solid ${COLORS.border}`, textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const rc = roleColors[user.role] || roleColors.service;
                  const ac = roleAvatarColors[user.role] || roleAvatarColors.service;
                  return (
                    <tr key={user.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                      <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: COLORS.primary, whiteSpace: 'nowrap' }}>{user.id}</td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                            {user.name[0].toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: COLORS.textLight }}>{user.email}</td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: '20px', backgroundColor: rc.bg, color: rc.color, fontSize: '12px', fontWeight: '600', textTransform: 'capitalize', border: `1px solid ${rc.border}` }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', backgroundColor: user.status === 'Active' ? '#ecfdf5' : '#fef2f2', color: user.status === 'Active' ? COLORS.success : COLORS.danger, fontSize: '12px', fontWeight: '600' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: user.status === 'Active' ? COLORS.success : COLORS.danger, display: 'inline-block' }} />
                          {user.status === 'Active' ? t.active : t.inactive}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '13px', color: COLORS.textLight, whiteSpace: 'nowrap' }}>{user.joined}</td>
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleToggle(user.id)} style={{ backgroundColor: `${COLORS.primary}10`, color: COLORS.primary, border: `1.5px solid ${COLORS.primary}25`, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.toggle}</button>
                          <button onClick={() => handleDelete(user.id)} style={{ backgroundColor: '#fef2f2', color: COLORS.danger, border: `1.5px solid #fecaca`, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.delete}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card-enter" style={{ backgroundColor: COLORS.white, borderRadius: '24px', padding: '36px', width: '480px', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: COLORS.text }}>{t.addNewUser}</h2>
                <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>{t.fillUser}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textLight, flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            {[
              { label: t.fullName, key: 'name', placeholder: t.namePlaceholder },
              { label: t.email, key: 'email', placeholder: t.emailPlaceholder },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '7px' }}>{field.label}</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa', color: COLORS.text, fontFamily: 'inherit' }} placeholder={field.placeholder} value={newUser[field.key]} onChange={e => setNewUser({ ...newUser, [field.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '10px' }}>{t.role}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { value: 'admin', color: COLORS.purple, bg: '#f5f3ff', desc: 'Full access' },
                  { value: 'technicien', color: COLORS.primary, bg: '#f0fdf9', desc: 'Pannes only' },
                  { value: 'service', color: COLORS.success, bg: '#ecfdf5', desc: 'Report only' },
                ].map(r => {
                  const selected = newUser.role === r.value;
                  return (
                    <button key={r.value} onClick={() => setNewUser({ ...newUser, role: r.value })}
                      style={{ padding: '14px 8px', borderRadius: '14px', border: `2px solid ${selected ? r.color : COLORS.border}`, backgroundColor: selected ? r.bg : '#fafafa', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: selected ? roleAvatarColors[r.value] : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="8" r="4" stroke={selected ? 'white' : '#94a3b8'} strokeWidth="2" />
                          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={selected ? 'white' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: selected ? r.color : COLORS.textLight, textTransform: 'capitalize' }}>{r.value}</span>
                      <span style={{ fontSize: '10px', color: selected ? r.color : '#94a3b8' }}>{r.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, color: COLORS.textLight, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{t.cancel}</button>
              <button onClick={handleAdd} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 14px rgba(20,184,166,0.35)` }}>{t.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;