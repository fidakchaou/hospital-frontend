import React, { useState, useEffect, useRef } from 'react';

function HeartbeatBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, time = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const ecgPattern = (x, amplitude) => {
      const t = x % 1;
      if (t < 0.3) return 0;
      if (t < 0.35) return amplitude * (t - 0.3) / 0.05;
      if (t < 0.4) return -amplitude * 0.3 * (t - 0.35) / 0.05;
      if (t < 0.45) return -amplitude * 0.3 + (amplitude * 1.3) * (t - 0.4) / 0.05;
      if (t < 0.5) return amplitude - amplitude * 2 * (t - 0.45) / 0.05;
      if (t < 0.55) return -amplitude + amplitude * 0.5 * (t - 0.5) / 0.05;
      if (t < 0.65) return -amplitude * 0.5 + amplitude * 0.5 * (t - 0.55) / 0.1;
      if (t < 0.75) return amplitude * 0.2 * Math.sin((t - 0.65) * Math.PI / 0.1);
      return 0;
    };

    const icons = Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 0.9 + 0.05, y: Math.random() * 0.8 + 0.1,
      type: i % 4, size: Math.random() * 12 + 10,
      opacity: Math.random() * 0.15 + 0.05,
      speed: Math.random() * 0.0003 + 0.0001,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.2 + 0.05,
      speed: Math.random() * 0.0002 + 0.0001,
      phase: Math.random() * Math.PI * 2,
      drift: (Math.random() - 0.5) * 0.0001,
    }));

    const drawMedicalCross = (x, y, size, opacity) => {
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#5eead4'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2); ctx.lineTo(x, y + size / 2);
      ctx.moveTo(x - size / 2, y); ctx.lineTo(x + size / 2, y);
      ctx.stroke(); ctx.restore();
    };

    const drawHeartIcon = (x, y, size, opacity) => {
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#99f6e4'; ctx.lineWidth = 1;
      const s = size * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, y + s * 0.5);
      ctx.bezierCurveTo(x, y, x - s, y, x - s, y - s * 0.5);
      ctx.bezierCurveTo(x - s, y - s * 1.2, x, y - s * 0.8, x, y - s * 0.3);
      ctx.bezierCurveTo(x, y - s * 0.8, x + s, y - s * 1.2, x + s, y - s * 0.5);
      ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.5);
      ctx.stroke(); ctx.restore();
    };

    const drawDNADot = (x, y, r, opacity) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(94, 234, 212, ${opacity})`; ctx.fill();
    };

    const drawPill = (x, y, size, opacity, angle) => {
      ctx.save(); ctx.globalAlpha = opacity;
      ctx.translate(x, y); ctx.rotate(angle);
      ctx.strokeStyle = '#ccfbf1'; ctx.lineWidth = 1;
      const w = size * 1.2, h = size * 0.5;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, h / 2);
      ctx.stroke(); ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.016;
      const W = canvas.width, H = canvas.height;

      [0.25, 0.5, 0.75].forEach((yRatio, lineIdx) => {
        const y = H * yRatio;
        const amplitude = H * 0.06;
        const speed = 0.4 + lineIdx * 0.1;
        const offset = time * speed + lineIdx * 2;

        ctx.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const xRatio = px / W;
          const ecgY = y + ecgPattern(xRatio * 3 + offset, amplitude);
          px === 0 ? ctx.moveTo(px, ecgY) : ctx.lineTo(px, ecgY);
        }

        const grad = ctx.createLinearGradient(0, 0, W, 0);
        const alpha = 0.07 + lineIdx * 0.02;
        grad.addColorStop(0, `rgba(20,184,166,0)`);
        grad.addColorStop(0.3, `rgba(20,184,166,${alpha})`);
        grad.addColorStop(0.7, `rgba(45,212,191,${alpha * 1.2})`);
        grad.addColorStop(1, `rgba(20,184,166,0)`);
        ctx.strokeStyle = grad; ctx.lineWidth = 1; ctx.stroke();

        const headX = ((time * speed * W / 3) % W + W) % W;
        const headXRatio = headX / W;
        const headY = y + ecgPattern(headXRatio * 3 + offset, amplitude);

        const glow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 12);
        glow.addColorStop(0, `rgba(45,212,191,0.5)`);
        glow.addColorStop(0.5, `rgba(20,184,166,0.2)`);
        glow.addColorStop(1, `rgba(20,184,166,0)`);
        ctx.beginPath(); ctx.arc(headX, headY, 12, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(headX, headY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45,212,191,0.9)`; ctx.fill();
      });

      icons.forEach((icon) => {
        const x = icon.x * W;
        const floatY = icon.y * H + Math.sin(time * icon.speed * 1000 + icon.phase) * 15;
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.8 + icon.phase);
        const opacity = icon.opacity * (0.7 + 0.3 * pulse);
        if (icon.type === 0) drawMedicalCross(x, floatY, icon.size, opacity);
        else if (icon.type === 1) drawHeartIcon(x, floatY, icon.size, opacity);
        else if (icon.type === 2) drawPill(x, floatY, icon.size, opacity, time * 0.2 + icon.phase);
        else drawDNADot(x, floatY, icon.r, opacity);
      });

      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const x1 = W * 0.85 + Math.sin(t * Math.PI * 4 + time * 0.5) * 20;
        const x2 = W * 0.85 + Math.sin(t * Math.PI * 4 + time * 0.5 + Math.PI) * 20;
        const y = H * 0.1 + t * H * 0.8;
        const alpha = 0.06 + 0.04 * Math.sin(t * Math.PI * 2);
        drawDNADot(x1, y, 1.5, alpha);
        drawDNADot(x2, y, 1.5, alpha * 0.7);
        if (i % 3 === 0) {
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(94,234,212,${alpha * 0.5})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      particles.forEach(p => {
        p.x += p.drift;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        const floatY = p.y + Math.sin(time * p.speed * 1000 + p.phase) * 0.02;
        drawDNADot(p.x * W, floatY * H, p.r, p.opacity);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

function HeartbeatLogo() {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, 48, 48);
      time += 0.04;
      const beat = Math.max(0, Math.sin(time * 2) > 0.7 ? (Math.sin(time * 2) - 0.7) / 0.3 : 0);
      const scale = 1 + beat * 0.15;
      const glowAlpha = 0.3 + beat * 0.5;

      ctx.save();
      ctx.translate(24, 24);
      ctx.scale(scale, scale);

      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
      glow.addColorStop(0, `rgba(45,212,191,${glowAlpha})`);
      glow.addColorStop(1, 'rgba(20,184,166,0)');
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${0.85 + beat * 0.15})`;
      ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pts = [[-11, 0], [-6, 0], [-4, -3], [-2, 5], [0, -8], [2, 5], [4, -2], [6, 0], [11, 0]];
      ctx.moveTo(pts[0][0], pts[0][1]);
      pts.slice(1).forEach(p => ctx.lineTo(p[0], p[1]));
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px', cursor: 'default' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #0f766e, #14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hovered ? '0 0 0 8px rgba(20,184,166,0.2), 0 12px 32px rgba(20,184,166,0.5)' : '0 8px 24px rgba(20,184,166,0.4)', transition: 'all 0.3s ease', transform: hovered ? 'scale(1.08)' : 'scale(1)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <canvas ref={canvasRef} width={48} height={48} style={{ display: 'block' }} />
      </div>
      <div>
        <div style={{ color: 'white', fontWeight: '800', fontSize: '20px', letterSpacing: '-0.3px', lineHeight: 1 }}>Taher Sfar</div>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '4px', fontWeight: '500', letterSpacing: '1.5px' }}>PUBLIC HOSPITAL — MAHDIA</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, label, desc, delay }) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 16px', borderRadius: '14px', backgroundColor: hovered ? 'rgba(20,184,166,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${hovered ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.07)'}`, backdropFilter: 'blur(10px)', transform: hovered ? 'translateX(6px)' : visible ? 'translateX(0)' : 'translateX(-20px)', opacity: visible ? 1 : 0, transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'default' }}>
      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: hovered ? 'linear-gradient(135deg, rgba(20,184,166,0.4), rgba(45,212,191,0.3))' : 'rgba(20,184,166,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s ease', boxShadow: hovered ? '0 4px 12px rgba(20,184,166,0.3)' : 'none' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
          <path d={icon} stroke={hovered ? '#99f6e4' : '#5eead4'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)', marginBottom: '2px', transition: 'color 0.2s ease' }}>{label}</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{desc}</div>
      </div>
      {hovered && (
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '3px', alignItems: 'center' }}>
          {[1, 0.6, 0.3].map((o, i) => (
            <div key={i} style={{ width: '3px', height: `${8 + i * 4}px`, borderRadius: '2px', backgroundColor: `rgba(45,212,191,${o})` }} />
          ))}
        </div>
      )}
    </div>
  );
}

function RoleCard({ value, label, desc, selected, onClick }) {
  const colors = {
    admin: { active: '#2dd4bf', bg: 'rgba(20,184,166,0.15)', border: '#2dd4bf' },
    technicien: { active: '#34d399', bg: 'rgba(52,211,153,0.12)', border: '#34d399' },
    service: { active: '#a3e635', bg: 'rgba(163,230,53,0.12)', border: '#a3e635' },
  };
  const c = colors[value] || colors.admin;

  return (
    <button onClick={onClick} style={{ padding: '12px 8px', borderRadius: '14px', border: `2px solid ${selected ? c.border : 'rgba(255,255,255,0.08)'}`, backgroundColor: selected ? c.bg : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1, transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform: selected ? 'scale(1.04) translateY(-2px)' : 'scale(1)', boxShadow: selected ? `0 6px 20px ${c.active}30` : 'none', backdropFilter: 'blur(10px)' }}>
      <span style={{ fontSize: '13px', fontWeight: '700', color: selected ? c.active : 'rgba(255,255,255,0.45)', transition: 'color 0.2s ease' }}>{label}</span>
      <span style={{ fontSize: '10px', color: selected ? c.active : 'rgba(255,255,255,0.25)', fontWeight: '500', transition: 'color 0.2s ease' }}>{desc}</span>
    </button>
  );
}

function InputField({ label, type, placeholder, value, onChange, icon, rightIcon, onRightClick, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const handleChange = (e) => { onChange(e); setHasValue(!!e.target.value); };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.35)', marginBottom: '7px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: focused ? '#2dd4bf' : 'rgba(255,255,255,0.25)', transition: 'color 0.25s ease', pointerEvents: 'none', zIndex: 1 }}>{icon}</div>
        <input type={type} placeholder={placeholder} value={value} onChange={handleChange} autoComplete={autoComplete || 'off'}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: '100%', padding: '13px 44px', borderRadius: '12px', fontSize: '14px', color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: focused ? 'rgba(20,184,166,0.08)' : 'rgba(255,255,255,0.04)', border: `1.5px solid ${focused ? 'rgba(20,184,166,0.5)' : hasValue ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}`, backdropFilter: 'blur(10px)', boxShadow: focused ? '0 0 0 4px rgba(20,184,166,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.03)', transition: 'all 0.25s ease' }}
        />
        {rightIcon && (
          <button type="button" onClick={onRightClick} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '6px', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
            {rightIcon}
          </button>
        )}
      </div>
    </div>
  );
}

function Toast({ message, type, visible }) {
  const config = {
    success: { color: '#14b8a6', icon: <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /> },
    error: { color: '#ef4444', icon: <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2" strokeLinecap="round" /> },
    info: { color: '#0f766e', icon: <><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" /><path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" /></> },
  };
  const c = config[type] || config.success;
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '16px', backgroundColor: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', backdropFilter: 'blur(24px)', transform: visible ? 'translateX(0) scale(1)' : 'translateX(140px) scale(0.9)', opacity: visible ? 1 : 0, transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)', minWidth: '280px', maxWidth: '360px' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${c.color}50` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">{c.icon}</svg>
      </div>
      <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4' }}>{message}</span>
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) { setEmail(remembered); setRememberMe(true); }
    return () => clearTimeout(t);
  }, []);

  const showToastMsg = (message, type) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3500);
  };

  const handleLogin = () => {
    if (!email) { showToastMsg('Please enter your email address', 'error'); return; }
    if (!password) { showToastMsg('Please enter your password', 'error'); return; }
    if (rememberMe) localStorage.setItem('rememberedEmail', email);
    else localStorage.removeItem('rememberedEmail');
    setLoading(true); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(interval); return 90; } return p + Math.random() * 15 + 5; });
    }, 120);
    setTimeout(() => {
      clearInterval(interval); setProgress(100);
      showToastMsg(`Welcome back! Signed in as ${role}`, 'success');
      setTimeout(() => onLogin(role), 900);
    }, 1600);
  };

  const roles = [
    { value: 'admin', label: 'Admin', desc: 'Full access' },
    { value: 'technicien', label: 'Technician', desc: 'Pannes only' },
    { value: 'service', label: 'Service', desc: 'Report only' },
  ];

  const features = [
    { icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z', label: 'Real-time incident tracking', desc: 'Monitor all technical failures instantly', delay: 400 },
    { icon: 'M2 4h20v14H2zM8 20h8M12 18v2', label: 'Equipment inventory control', desc: 'Track all hospital IT assets', delay: 550 },
    { icon: 'M9 7a4 4 0 100 8 4 4 0 000-8zM3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2', label: 'Role-based access control', desc: 'Admin, Technician, and Service roles', delay: 700 },
    { icon: 'M18 20V10M12 20V4M6 20v-6', label: 'Advanced analytics', desc: 'Performance reports and insights', delay: 850 },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes progressGlow { 0%,100% { box-shadow: 0 0 8px rgba(45,212,191,0.4); } 50% { box-shadow: 0 0 16px rgba(45,212,191,0.8); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes statusPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(45,212,191,0.5); } 50% { box-shadow: 0 0 0 7px rgba(45,212,191,0); } }
        ::placeholder { color: rgba(255,255,255,0.18) !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px rgba(4,47,46,0.9) inset !important; -webkit-text-fill-color: white !important; }
        * { box-sizing: border-box; }
      `}</style>

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <div onKeyDown={e => { if (e.key === 'Enter' && !loading) handleLogin(); }}
        style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>

        {/* LEFT PANEL */}
        <div style={{ flex: 1.15, position: 'relative', overflow: 'hidden', background: 'linear-gradient(150deg, #022c22 0%, #042f2e 25%, #0f4c3f 50%, #065f46 75%, #0f766e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
          <HeartbeatBackground />

          <div style={{ position: 'absolute', top: '5%', left: '-5%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(20,184,166,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '0%', right: '-5%', width: '45%', height: '45%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(45,212,191,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40%', height: '30%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(20,184,166,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '490px', width: '100%', opacity: mounted ? 1 : 0, transform: mounted ? 'translateX(0)' : 'translateX(-30px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
            <HeartbeatLogo />

            <h1 style={{ color: 'white', fontSize: '44px', fontWeight: '900', lineHeight: '1.08', margin: '0 0 18px', letterSpacing: '-2px', animation: 'fadeSlideUp 0.8s 0.2s ease both' }}>
              Intelligent IT<br />
              <span style={{ background: 'linear-gradient(135deg, #5eead4 0%, #99f6e4 40%, #ccfbf1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', display: 'inline-block' }}>
                Infrastructure
              </span><br />
              Management
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', lineHeight: '1.75', marginBottom: '36px', fontWeight: '400', maxWidth: '380px', animation: 'fadeSlideUp 0.8s 0.3s ease both' }}>
              A complete system to track incidents, manage equipment, and coordinate your IT team with precision and intelligence.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.map((f, i) => <FeatureCard key={i} {...f} />)}
            </div>

            <div style={{ marginTop: '28px', display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '8px 16px', animation: 'fadeSlideUp 1s 0.6s ease both' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2dd4bf', animation: 'statusPulse 2s infinite' }} />
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontWeight: '500', letterSpacing: '0.3px' }}>System Online — Taher Sfar Hospital</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', overflowY: 'auto', position: 'relative', background: 'linear-gradient(160deg, #042f2e 0%, #022c22 50%, #011a15 100%)' }}>

          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(20,184,166,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(ellipse at top right, rgba(20,184,166,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '250px', height: '250px', background: 'radial-gradient(ellipse at bottom left, rgba(45,212,191,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />

          <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s' }}>

            <div style={{ marginBottom: '32px', animation: 'fadeSlideUp 0.8s 0.25s ease both' }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: '800', color: 'white', letterSpacing: '-0.8px' }}>Welcome back</h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.35)', fontWeight: '400' }}>Sign in to access the dashboard </p>
            </div>

            <div style={{ marginBottom: '24px', animation: 'fadeSlideUp 0.8s 0.3s ease both' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', marginBottom: '10px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Select your role</label>
              <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                {roles.map(r => <RoleCard key={r.value} {...r} selected={role === r.value} onClick={() => setRole(r.value)} />)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', animation: 'fadeSlideUp 0.8s 0.35s ease both' }}>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontWeight: '600', letterSpacing: '0.8px' }}>CREDENTIALS</span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))' }} />
            </div>

            <div style={{ animation: 'fadeSlideUp 0.8s 0.4s ease both' }}>
              <InputField label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" /><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" /></svg>}
              />
            </div>

            <div style={{ animation: 'fadeSlideUp 0.8s 0.45s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Password</label>
                <span onClick={() => alert('Please contact your system administrator to reset your password.')}
                  style={{ fontSize: '12px', color: '#2dd4bf', cursor: 'pointer', fontWeight: '500', transition: 'color 0.2s ease' }}
                  onMouseEnter={e => e.target.style.color = '#99f6e4'}
                  onMouseLeave={e => e.target.style.color = '#2dd4bf'}>
                  Forgot password?
                </span>
              </div>
              <InputField label="" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
                rightIcon={showPassword
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>
                }
                onRightClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', animation: 'fadeSlideUp 0.8s 0.5s ease both' }}>
              <div onClick={() => setRememberMe(!rememberMe)} style={{ width: '18px', height: '18px', borderRadius: '5px', cursor: 'pointer', flexShrink: 0, backgroundColor: rememberMe ? '#14b8a6' : 'transparent', border: `2px solid ${rememberMe ? '#14b8a6' : 'rgba(255,255,255,0.15)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', transform: rememberMe ? 'scale(1.1)' : 'scale(1)', boxShadow: rememberMe ? '0 0 0 3px rgba(20,184,166,0.2)' : 'none' }}>
                {rememberMe && <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <span onClick={() => setRememberMe(!rememberMe)} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontWeight: '400', userSelect: 'none' }}>
                Remember me on this device
              </span>
            </div>

            <div style={{ animation: 'fadeSlideUp 0.8s 0.55s ease both' }}>
              <button onClick={handleLogin} disabled={loading}
                style={{ width: '100%', padding: '15px', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: loading ? 'rgba(20,184,166,0.4)' : 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #2dd4bf 100%)', boxShadow: loading ? 'none' : '0 8px 28px rgba(20,184,166,0.45)', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', letterSpacing: '0.2px', position: 'relative', overflow: 'hidden' }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(20,184,166,0.55)'; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 28px rgba(20,184,166,0.45)'; }}>
                {loading ? (
                  <>
                    <svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></>
                )}
              </button>

              {loading && (
                <div style={{ marginTop: '12px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #14b8a6, #2dd4bf)', borderRadius: '2px', animation: 'progressGlow 0.8s infinite', transition: 'width 0.15s ease' }} />
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', animation: 'fadeSlideUp 1s 0.65s ease both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06))' }} />
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="rgba(255,255,255,0.15)" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" /></svg>
                <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to left, transparent, rgba(255,255,255,0.06))' }} />
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.3px' }}>
                Secure access — Hospital IT Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;