import React, { useState } from 'react';
import { showToast } from './Toast';

function Pannes({ pannes, onAddPanne, onDeletePanne, onUpdatePanne, t, theme }) {
  const C = theme || {
    primary: '#14b8a6', primaryDark: '#0f766e',
    success: '#10b981', warning: '#f59e0b', danger: '#ef4444',
    text: '#0f172a', textLight: '#64748b', textMuted: '#94a3b8',
    border: '#ccfbf1', white: '#ffffff', bg: '#f0fdf9',
    card: '#ffffff', bgTertiary: '#f0fdf9', cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const [showModal, setShowModal] = useState(false);
  const [editPanne, setEditPanne] = useState(null); // null = add, object = edit
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ service: '', description: '', priority: 'Moyenne', technicien: '' });

  const openAdd = () => { setEditPanne(null); setFormData({ service: '', description: '', priority: 'Moyenne', technicien: '' }); setShowModal(true); };
  const openEdit = (panne) => { setEditPanne(panne); setFormData({ service: panne.service, description: panne.description, priority: panne.priority, technicien: panne.technicien || '' }); setShowModal(true); };

  const handleSave = () => {
    if (!formData.service || !formData.description) { showToast(t.cancel === 'Cancel' ? 'Please fill all required fields' : 'Veuillez remplir tous les champs', 'error'); return; }
    if (editPanne) {
      onUpdatePanne(editPanne.id, { service: formData.service, description: formData.description, priority: formData.priority, technicien: formData.technicien || (t.cancel === 'Cancel' ? 'Not assigned' : 'Non assigné') });
      showToast(t.cancel === 'Cancel' ? 'Panne updated successfully!' : 'Panne mise à jour!', 'success');
    } else {
      onAddPanne({ ...formData, status: 'En cours', technicien: formData.technicien || (t.cancel === 'Cancel' ? 'Not assigned' : 'Non assigné'), date: new Date().toISOString().split('T')[0] });
      showToast(t.cancel === 'Cancel' ? 'Panne added successfully!' : 'Panne ajoutée!', 'success');
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(t.cancel === 'Cancel' ? 'Are you sure you want to delete this panne?' : 'Voulez-vous supprimer cette panne?')) {
      onDeletePanne(id);
      showToast(t.cancel === 'Cancel' ? 'Panne deleted' : 'Panne supprimée', 'info');
    }
  };

  const handleStatusChange = (id, status) => {
    onUpdatePanne(id, { status });
    showToast(t.cancel === 'Cancel' ? `Status updated to "${status}"` : `Statut mis à jour: "${status}"`, 'success');
  };

  const statusValues = ['All', 'En cours', 'Terminée', 'Difficile'];
  const statusLabels = [t.filterAll, t.statusEnCours, t.statusTerminee, t.statusDifficile];

  const filtered = pannes
    .filter(p => filterStatus === 'All' || p.status === filterStatus)
    .filter(p => !search || p.service?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase()) || p.technicien?.toLowerCase().includes(search.toLowerCase()));

  const PriorityBadge = ({ priority }) => {
    const map = { 'Élevée': { color: '#dc2626', bg: '#fef2f2', label: t.elevee }, 'Moyenne': { color: '#d97706', bg: '#fffbeb', label: t.moyenne }, 'Faible': { color: '#059669', bg: '#ecfdf5', label: t.faible } };
    const s = map[priority] || map['Faible'];
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', backgroundColor: s.bg, color: s.color, fontSize: '12px', fontWeight: '600' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: s.color, display: 'inline-block' }} />{s.label}</span>;
  };

  const priorityOptions = [
    { value: 'Faible', label: t.faible, color: C.success, desc: t.lowImpact, icon: <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
    { value: 'Moyenne', label: t.moyenne, color: C.warning, desc: t.mediumImpact, icon: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
    { value: 'Élevée', label: t.elevee, color: C.danger, desc: t.highImpact, icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
  ];

  return (
    <div className="page-enter" style={{ padding: '28px', backgroundColor: C.bg, minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: C.text, letterSpacing: '-0.5px' }}>{t.pannes}</h1>
          <p style={{ margin: '4px 0 0', color: C.textLight, fontSize: '14px' }}>{pannes.length} {t.totalPannes}</p>
        </div>
        <button onClick={openAdd} style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', border: 'none', padding: '11px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: `0 4px 14px rgba(20,184,166,0.35)`, fontFamily: 'inherit' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" /></svg>
          {t.newPanne}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '22px' }}>
        {[
          { label: t.enCours, value: pannes.filter(p => p.status === 'En cours').length, color: C.warning, bg: theme?.isDark ? '#2d1f00' : '#fffbeb', icon: <><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
          { label: t.terminees, value: pannes.filter(p => p.status === 'Terminée').length, color: C.success, bg: theme?.isDark ? '#00230f' : '#ecfdf5', icon: <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
          { label: t.difficiles, value: pannes.filter(p => p.status === 'Difficile').length, color: C.danger, bg: theme?.isDark ? '#2d0000' : '#fef2f2', icon: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
        ].map((s, i) => (
          <div key={i} className="card-enter" style={{ backgroundColor: s.bg, borderRadius: '16px', padding: '20px 22px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" color={s.color}>{s.icon}</svg>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: C.textLight, marginTop: '2px', fontWeight: '500' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <div style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: C.textMuted }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: '10px', border: `1.5px solid ${C.border}`, fontSize: '14px', backgroundColor: C.card, color: C.text, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statusValues.map((f, i) => (
            <button key={f} onClick={() => setFilterStatus(f)} style={{ padding: '10px 16px', borderRadius: '10px', border: `1.5px solid ${filterStatus === f ? C.primary : C.border}`, cursor: 'pointer', fontSize: '13px', fontWeight: '600', backgroundColor: filterStatus === f ? `${C.primary}15` : C.card, color: filterStatus === f ? C.primary : C.textLight, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
              {statusLabels[i]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: C.card, borderRadius: '20px', border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: C.cardShadow }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '72px', textAlign: 'center', color: C.textLight }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '700', color: C.text, marginBottom: '8px' }}>{t.noPannesFound}</div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>{t.addFirstPanne}</div>
            <button onClick={openAdd} style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', border: 'none', padding: '11px 22px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{t.newPanne}</button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr style={{ backgroundColor: theme?.isDark ? C.bgTertiary : '#f8fffe' }}>
                  {[t.id, t.service, t.description, t.priority, t.status, t.technicien, t.date, t.actions].map(h => (
                    <th key={h} style={{ padding: '13px 18px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: C.textLight, borderBottom: `1px solid ${C.border}`, textTransform: 'uppercase', letterSpacing: '0.7px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((panne) => (
                  <tr key={panne.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: C.primary, whiteSpace: 'nowrap' }}>{panne.id}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '600', color: C.text, whiteSpace: 'nowrap' }}>{panne.service}</td>
                    <td title={panne.description} style={{ padding: '14px 18px', fontSize: '13px', color: C.textLight, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>{panne.description}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}><PriorityBadge priority={panne.priority} /></td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <select value={panne.status} onChange={e => handleStatusChange(panne.id, e.target.value)} style={{ padding: '6px 10px', borderRadius: '8px', border: `1.5px solid ${C.border}`, fontSize: '12px', cursor: 'pointer', backgroundColor: C.bg, color: C.text, fontWeight: '500', outline: 'none', fontFamily: 'inherit' }}>
                        <option value="En cours">{t.statusEnCours}</option>
                        <option value="Terminée">{t.statusTerminee}</option>
                        <option value="Difficile">{t.statusDifficile}</option>
                      </select>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: C.text, whiteSpace: 'nowrap' }}>{panne.technicien}</td>
                    <td style={{ padding: '14px 18px', fontSize: '13px', color: C.textLight, whiteSpace: 'nowrap' }}>{panne.date}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {/* EDIT BUTTON */}
                        <button onClick={() => openEdit(panne)} style={{ backgroundColor: `${C.primary}15`, color: C.primary, border: `1.5px solid ${C.primary}30`, padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                          {t.cancel === 'Cancel' ? 'Edit' : 'Modifier'}
                        </button>
                        <button onClick={() => handleDelete(panne.id)} style={{ backgroundColor: '#fef2f2', color: C.danger, border: '1.5px solid #fecaca', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(6px)' }}>
          <div className="card-enter" style={{ backgroundColor: C.card, borderRadius: '24px', padding: '36px', width: '500px', boxShadow: '0 25px 80px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${C.border}` }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: '800', color: C.text }}>
                  {editPanne ? (t.cancel === 'Cancel' ? ' Edit Panne' : ' Modifier la Panne') : t.addNewPanne}
                </h2>
                <p style={{ margin: 0, color: C.textLight, fontSize: '14px' }}>
                  {editPanne ? (t.cancel === 'Cancel' ? 'Update the panne details below' : 'Mettez à jour les détails') : t.fillDetails}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: '36px', height: '36px', borderRadius: '10px', border: `1.5px solid ${C.border}`, backgroundColor: C.card, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textLight, flexShrink: 0, fontFamily: 'inherit' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              </button>
            </div>

            {[
              { label: t.service, key: 'service', placeholder: t.servicePlaceholder },
              { label: t.description, key: 'description', placeholder: t.descriptionPlaceholder, textarea: true },
              { label: t.technicien, key: 'technicien', placeholder: t.technicienPlaceholder },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '7px' }}>{field.label}</label>
                {field.textarea
                  ? <textarea style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: C.bgTertiary, resize: 'none', height: '90px', fontFamily: 'inherit', color: C.text }} placeholder={field.placeholder} value={formData[field.key]} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })} />
                  : <input style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: `1.5px solid ${C.border}`, fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: C.bgTertiary, color: C.text, fontFamily: 'inherit' }} placeholder={field.placeholder} value={formData[field.key]} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })} />
                }
              </div>
            ))}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: C.text, marginBottom: '10px' }}>{t.priority}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {priorityOptions.map(p => {
                  const sel = formData.priority === p.value;
                  return (
                    <button key={p.value} onClick={() => setFormData({ ...formData, priority: p.value })} style={{ padding: '14px 8px', borderRadius: '14px', border: `2px solid ${sel ? p.color : C.border}`, backgroundColor: sel ? `${p.color}10` : C.bgTertiary, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', fontFamily: 'inherit' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: sel ? `${p.color}20` : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${sel ? p.color : 'transparent'}` }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: sel ? p.color : C.textMuted }} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: sel ? p.color : C.textLight }}>{p.label}</span>
                      <span style={{ fontSize: '10px', color: sel ? p.color : C.textMuted, textAlign: 'center' }}>{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '12px', border: `1.5px solid ${C.border}`, backgroundColor: C.card, color: C.textLight, fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{t.cancel}</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: 'white', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: `0 4px 14px rgba(20,184,166,0.35)`, fontFamily: 'inherit' }}>
                {editPanne ? (t.cancel === 'Cancel' ? 'Save Changes ✓' : 'Enregistrer ✓') : `${t.add} →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pannes;