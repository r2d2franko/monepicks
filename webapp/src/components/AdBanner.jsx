import React, { useEffect, useRef } from 'react';

export function AdBanner() {
  const bannerRef = useRef(null);

  useEffect(() => {
    // Nos aseguramos de que el contenedor exista y esté vacío para no inyectar el script varias veces en re-renders
    if (bannerRef.current && !bannerRef.current.hasChildNodes()) {
      // 1. Script de configuración (atOptions)
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : '5840104a941bb8f1db7198c8c9c6ec86',
          'format' : 'iframe',
          'height' : 300,
          'width' : 160,
          'params' : {}
        };
      `;
      bannerRef.current.appendChild(confScript);

      // 2. Script que llama a los anuncios (invoke.js)
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      // Hacemos que sea asíncrono para que no bloquee la carga de tu página
      invokeScript.async = true; 
      invokeScript.src = "https://www.highperformanceformat.com/5840104a941bb8f1db7198c8c9c6ec86/invoke.js";
      bannerRef.current.appendChild(invokeScript);
    }
  }, []);

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
      margin: '1.5rem 0',
      minHeight: '320px' // Ajustado para que quepa el alto de 300px del anuncio
    }}>
      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
        Publicidad
      </span>
      
      {/* Contenedor referenciado donde React inyectará los scripts del anuncio */}
      <div ref={bannerRef} style={{ width: '160px', height: '300px' }}></div>
      
    </div>
  );
}
