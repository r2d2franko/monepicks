import React, { useEffect, useRef } from 'react';

export function AdBanner({ adKey, width, height }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    // Nos aseguramos de que el contenedor exista y esté vacío para no inyectar el script varias veces en re-renders
    if (bannerRef.current && !bannerRef.current.hasChildNodes()) {
      // 1. Script de configuración (atOptions)
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      bannerRef.current.appendChild(confScript);

      // 2. Script que llama a los anuncios (invoke.js)
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.async = true; 
      invokeScript.src = "https://www.highperformanceformat.com/" + adKey + "/invoke.js";
      bannerRef.current.appendChild(invokeScript);
    }
  }, [adKey, width, height]);

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
      
      {/* Contenedor referenciado donde React inyectará los scripts del anuncio */}
      <div ref={bannerRef} style={{ width: width + "px", height: height + "px" }}></div>
      
    </div>
  );
}
