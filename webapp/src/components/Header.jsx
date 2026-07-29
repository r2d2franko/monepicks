import { TrendingUp, Search } from 'lucide-react';
import '../styles/global.css';

export function Header() {
  return (
    <header style={{
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--card-border)',
      background: 'var(--bg-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <TrendingUp size={28} color="var(--accent)" strokeWidth={2.5} />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', margin: 0, color: 'white' }}>
            Mone<span style={{ color: 'var(--text-main)' }}>Picks</span>
          </h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', borderBottom: '2px solid var(--accent)', paddingBottom: '0.25rem' }}>INICIO</a>
          {/* Enlaces ocultos temporalmente 
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>PRONÓSTICOS</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>ANALÍTICA</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>VIP</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>BLOG</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>AYUDA</a>
          */}
        </nav>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
        {/* Botones de sesión ocultos temporalmente 
        <button style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          padding: '0.5rem 1.25rem',
          borderRadius: '24px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease'
        }}>
          REGÍSTRATE GRATIS
        </button>
        <button style={{
          background: 'transparent',
          border: '1px solid var(--card-border)',
          color: 'var(--text-main)',
          padding: '0.5rem 1.25rem',
          borderRadius: '24px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          transition: 'all 0.2s ease'
        }}>
          INICIAR SESIÓN
        </button>
        */}
      </div>
    </header>
  );
}
