import React from 'react';

export function AdBanner({ htmlFile, width, height }) {
  return (
    <div style={{
      width: '100%',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px dashed var(--card-border)',
      borderRadius: '12px',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: (height + 40) + "px"
    }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
        Publicidad
      </span>
      
      {/* Cargamos el HTML del anuncio en un iframe aislado */}
      <iframe 
        src={`/banners/${htmlFile}`}
        width={width}
        height={height}
        frameBorder="0"
        scrolling="no"
        style={{ border: 'none', overflow: 'hidden' }}
        title="Advertisement"
      ></iframe>
      
    </div>
  );
}
