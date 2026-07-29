import { TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      gap: '2rem'
    }}>
      <div style={{ flex: 1, maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 800, 
          lineHeight: 1.1, 
          marginBottom: '1.5rem',
          color: 'var(--text-main)'
        }}>
          Domina tus Apuestas con Pronósticos Expertos e IA
        </h1>
        <p style={{ 
          fontSize: '1.125rem', 
          color: 'var(--text-muted)', 
          marginBottom: '2.5rem',
          lineHeight: 1.6
        }}>
          Accede a análisis profundos, estadísticas en tiempo real y selecciones ganadoras para tus deportes favoritos.
        </p>
        <button style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
          transition: 'all 0.2s ease'
        }}>
          Obtén Pronósticos VIP Ahora
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', opacity: 0.9 }}>
        <TrendingUp size={280} color="var(--accent)" strokeWidth={1} style={{ filter: 'drop-shadow(0px 10px 20px rgba(16, 185, 129, 0.2))' }} />
      </div>
    </div>
  );
}
