export function AdBanner() {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(0, 0, 0, 0.3)',
      border: '1px dashed var(--card-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)',
      margin: '1.5rem 0',
      minHeight: '120px'
    }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        Publicidad
      </span>
      <div style={{ fontWeight: 500 }}>
        Espacio disponible para anuncios
      </div>
    </div>
  );
}
