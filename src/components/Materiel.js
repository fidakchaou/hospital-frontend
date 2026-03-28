import React, { useState, useEffect } from 'react';
import { showToast } from './Toast';

const COLORS = {
  primary: '#14b8a6', primaryDark: '#0f766e',
  success: '#10b981', warning: '#f59e0b', danger: '#ef4444', purple: '#8b5cf6',
  text: '#0f172a', textLight: '#64748b', border: '#e2e8f0', white: '#ffffff', bg: '#f0fdf9',
};

function generateMaterielId(list) {
  if (list.length === 0) return 'M-001';
  const nums = list.map(m => parseInt(m.id.replace('M-', ''))).filter(n => !isNaN(n));
  if (nums.length === 0) return 'M-001';
  return `M-${String(Math.max(...nums) + 1).padStart(3, '0')}`;
}

function StatusBadge({ status, t }) {
  const isAvailable = status === 'Available';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', backgroundColor: isAvailable ? '#ecfdf5' : '#fef2f2', color: isAvailable ? COLORS.success : COLORS.danger, fontSize: '12px', fontWeight: '600' }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isAvailable ? COLORS.success : COLORS.danger, display: 'inline-block' }} />
      {isAvailable ? t.available : t.unavailable}
    </span>
  );
}

function Materiel({ t, onNewMateriel }) {
  const [materiel, setMateriel] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [newItem, setNewItem] = useState({ nom: '', type: '', service: '', status: 'Available' });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('materiel_v2');
      if (saved) setMateriel(JSON.parse(saved));
    } catch { setMateriel([]); }
  }, []);

  const saveMateriel = (data) => {
    setMateriel(data);
    localStorage.setItem('materiel_v2', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!newItem.nom || !newItem.type || !newItem.service) {
      showToast(t.cancel === 'Cancel' ? 'Please fill all fields' : 'Veuillez remplir tous les champs', 'error');
      return;
    }
    const id = generateMaterielId(materiel);
    const item = { id, nom: newItem.nom, type: newItem.type, service: newItem.service, status: newItem.status, date: new Date().toISOString().split('T')[0] };
    saveMateriel([item, ...materiel]);
    if (onNewMateriel) onNewMateriel();
    showToast(t.cancel === 'Cancel' ? 'Equipment added successfully!' : 'Équipement ajouté avec succès!', 'success');
    setNewItem({ nom: '', type: '', service: '', status: 'Available' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(t.cancel === 'Cancel' ? 'Are you sure?' : 'Êtes-vous sûr?')) {
      saveMateriel(materiel.filter(m => m.id !== id));
      showToast(t.cancel === 'Cancel' ? 'Equipment deleted' : 'Équipement supprimé', 'info');
    }
  };

  const handleToggle = (id) => {
    const updated = materiel.map(m => m.id === id ? { ...m, status: m.status === 'Available' ? 'Unavailable' : 'Available' } : m);
    saveMateriel(updated);
    showToast(t.cancel === 'Cancel' ? 'Status updated' : 'Statut mis à jour', 'success');
  };

  const filtered = materiel
    .filter(m => filterStatus === 'All' || m.status === filterStatus)
    .filter(m => !search || m.nom?.toLowerCase().includes(search.toLowerCase()) || m.type?.toLowerCase().includes(search.toLowerCase()) || m.service?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-enter" style={{ padding: '28px', backgroundColor: COLORS.bg, minHeight: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: COLORS.text, letterSpacing: '-0.5px' }}>{t.materiel}</h1>
          <p style={{ margin: '4px 0 0', color: COLORS.textLight, fontSize: '14px' }}>{materiel.length} {t.totalEquipment}</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px rgba(20,184,166,0.35)` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
          {t.addMateriel}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '22px' }}>
        {[
          { label: t.total, value: materiel.length, color: COLORS.primary, bg: '#f0fdf9', icon: <rect x="2" y="4" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /> },
          { label: t.available, value: materiel.filter(m => m.status === 'Available').length, color: COLORS.success, bg: '#ecfdf5', icon: <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
          { label: t.unavailable, value: materiel.filter(m => m.status === 'Unavailable').length, color: COLORS.danger, bg: '#fef2f2', icon: <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /> },
        ].map((s, i) => (
          <div key={i} className="card-enter" style={{ backgroundColor: s.bg, borderRadius: '16px', padding: '20px 22px', border: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" color={s.color}>{s.icon}</svg>
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {[{ label: t.filterAll, value: 'All' }, { label: t.available, value: 'Available' }, { label: t.unavailable, value: 'Unavailable' }].map(f => (
            <button key={f.value} onClick={() => setFilterStatus(f.value)} style={{ padding: '10px 16px', borderRadius: '10px', border: `1.5px solid ${filterStatus === f.value ? COLORS.primary : COLORS.border}`, cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: filterStatus === f.value ? `${COLORS.primary}10` : COLORS.white, color: filterStatus === f.value ? COLORS.primary : COLORS.textLight, whiteSpace: 'nowrap' }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: COLORS.white, borderRadius: '20px', border: `1px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '72px', textAlign: 'center', color: COLORS.textLight }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke="#94a3b8" strokeWidth="2" /><path d="M8 20h8M12 18v2" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: COLORS.text, marginBottom: '8px' }}>{t.noEquipment}</div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>{t.addFirstEquipment}</div>
            <button onClick={() => setShowModal(true)} style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', border: 'none', padding: '11px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {t.addMateriel}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {[t.id, t.nom, t.type, t.service, t.status, t.date, t.actions].map(h => (
                    <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: COLORS.textLight, borderBottom: `1px solid ${COLORS.border}`, textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: COLORS.primary, whiteSpace: 'nowrap' }}>{item.id}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#f0fdf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="14" rx="2" stroke={COLORS.primary} strokeWidth="2" /><path d="M8 20h8M12 18v2" stroke={COLORS.primary} strokeWidth="2" strokeLinecap="round" /></svg>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: COLORS.text }}>{item.nom}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: COLORS.textLight, whiteSpace: 'nowrap' }}>{item.type}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: COLORS.text, whiteSpace: 'nowrap' }}>{item.service}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}><StatusBadge status={item.status} t={t} /></td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: COLORS.textLight, whiteSpace: 'nowrap' }}>{item.date}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleToggle(item.id)} style={{ backgroundColor: `${COLORS.primary}10`, color: COLORS.primary, border: `1.5px solid ${COLORS.primary}25`, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.toggle}</button>
                        <button onClick={() => handleDelete(item.id)} style={{ backgroundColor: '#fef2f2', color: COLORS.danger, border: `1.5px solid #fecaca`, padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>{t.delete}</button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: COLORS.text }}>{t.addNewMateriel}</h2>
                <p style={{ margin: 0, color: COLORS.textLight, fontSize: '14px' }}>{t.fillEquipment}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textLight, flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>
            {[
              { label: t.nom, key: 'nom', placeholder: 'e.g. HP LaserJet' },
              { label: t.type, key: 'type', placeholder: 'e.g. Printer' },
              { label: t.service, key: 'service', placeholder: t.servicePlaceholder },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '7px' }}>{field.label}</label>
                <input style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#fafafa', color: COLORS.text, fontFamily: 'inherit' }} placeholder={field.placeholder} value={newItem[field.key]} onChange={e => setNewItem({ ...newItem, [field.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: COLORS.text, marginBottom: '10px' }}>{t.status}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { value: 'Available', label: t.available, color: COLORS.success, bg: '#ecfdf5' },
                  { value: 'Unavailable', label: t.unavailable, color: COLORS.danger, bg: '#fef2f2' },
                ].map(s => (
                  <button key={s.value} onClick={() => setNewItem({ ...newItem, status: s.value })}
                    style={{ padding: '14px', borderRadius: '12px', border: `2px solid ${newItem.status === s.value ? s.color : COLORS.border}`, backgroundColor: newItem.status === s.value ? s.bg : '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: newItem.status === s.value ? s.color : '#94a3b8' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: newItem.status === s.value ? s.color : COLORS.textLight }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: `1.5px solid ${COLORS.border}`, backgroundColor: COLORS.white, color: COLORS.textLight, fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>{t.cancel}</button>
              <button onClick={handleAdd} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 14px rgba(99,102,241,0.35)` }}>{t.add}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Materiel;