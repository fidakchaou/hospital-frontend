import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Layout from './components/Layout';
import { ToastContainer } from './components/Toast';

function generateId(pannes) {
  if (pannes.length === 0) return 'P-001';
  const nums = pannes.map(p => parseInt(p.id.replace('P-', ''))).filter(n => !isNaN(n));
  if (nums.length === 0) return 'P-001';
  return `P-${String(Math.max(...nums) + 1).padStart(3, '0')}`;
}

function App() {
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('');
  const [lang, setLang] = useState('en');

  const [pannes, setPannes] = useState(() => {
    try { const s = localStorage.getItem('pannes_v3'); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });

  const [unseenCount, setUnseenCount] = useState(() => {
    try { const s = localStorage.getItem('unseenCount_v2'); return s ? parseInt(s) : 0; }
    catch { return 0; }
  });

  const [materielNotif, setMaterielNotif] = useState(() => {
    try { const s = localStorage.getItem('materielNotif'); return s ? parseInt(s) : 0; }
    catch { return 0; }
  });

  const [usersNotif, setUsersNotif] = useState(() => {
    try { const s = localStorage.getItem('usersNotif'); return s ? parseInt(s) : 0; }
    catch { return 0; }
  });

  useEffect(() => { localStorage.setItem('pannes_v3', JSON.stringify(pannes)); }, [pannes]);
  useEffect(() => { localStorage.setItem('unseenCount_v2', unseenCount.toString()); }, [unseenCount]);
  useEffect(() => { localStorage.setItem('materielNotif', materielNotif.toString()); }, [materielNotif]);
  useEffect(() => { localStorage.setItem('usersNotif', usersNotif.toString()); }, [usersNotif]);

  const handleAddPanne = (newPanne) => {
    const panne = { ...newPanne, id: generateId(pannes) };
    setPannes(prev => [panne, ...prev]);
    setUnseenCount(prev => prev + 1);
  };

  const handleDeletePanne = (id) => { setPannes(prev => prev.filter(p => p.id !== id)); };
  const handleUpdatePanne = (id, changes) => { setPannes(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p)); };
  const handleSeenPannes = () => setUnseenCount(0);
  const handleSeenMateriel = () => setMaterielNotif(0);
  const handleSeenUsers = () => setUsersNotif(0);
  const handleNewMateriel = () => setMaterielNotif(prev => prev + 1);
  const handleNewUser = () => setUsersNotif(prev => prev + 1);
  const handleLogout = () => { setPage('login'); setRole(''); };

  if (page === 'login') {
    return (
      <>
        <Login onLogin={(selectedRole) => { setRole(selectedRole); setPage('dashboard'); }} />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <Layout
        role={role}
        pannes={pannes}
        unseenCount={unseenCount}
        materielNotif={materielNotif}
        usersNotif={usersNotif}
        onAddPanne={handleAddPanne}
        onDeletePanne={handleDeletePanne}
        onUpdatePanne={handleUpdatePanne}
        onSeenPannes={handleSeenPannes}
        onSeenMateriel={handleSeenMateriel}
        onSeenUsers={handleSeenUsers}
        onNewMateriel={handleNewMateriel}
        onNewUser={handleNewUser}
        onLogout={handleLogout}
        lang={lang}
        setLang={setLang}
      />
      <ToastContainer />
    </>
  );
}

export default App;