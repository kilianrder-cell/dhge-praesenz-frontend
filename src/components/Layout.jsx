// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';

const NavItem = ({ label, path, icon }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.startsWith(path);

  return (
    <button
      onClick={() => navigate(path)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '8px',
        background: active ? 'var(--green-light)' : 'transparent',
        color: active ? 'var(--green-primary)' : 'var(--text-secondary)',
        fontWeight: active ? 700 : 500, fontSize: '14px',
        width: '100%', border: 'none', cursor: 'pointer',
        textAlign: 'left', transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '18px' }}>{icon}</span>
      {label}
    </button>
  );
};

export default function Layout({ children, navItems, userName, userEmail }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: '240px', background: 'var(--surface)',
        borderRight: '1px solid var(--border)', padding: '24px 16px',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
      }} className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', padding: '0 4px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--green-primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>DHGE Präsenz</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Anwesenheit digital</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems?.map((item) => <NavItem key={item.path} {...item} />)}
        </nav>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          <div style={{ padding: '8px 4px', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{userName}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{userEmail}</div>
          </div>
          <button className="btn btn-ghost btn-full" style={{ fontSize: '13px' }} onClick={() => navigate('/')}>
            ← Abmelden
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: '240px', flex: 1, padding: '32px', maxWidth: '1100px' }} className="main-content">
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}