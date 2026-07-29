import { useState } from 'react';
import { getTeamLogo } from '../utils/getMlbLogo';

export function PredictionCard({ prediction, index }) {
  const [showModal, setShowModal] = useState(false);
  const prob = parseInt(prediction.probabilidad) || 0;
  
  const localName = prediction.equipo_local || 'Local';
  const visitaName = prediction.equipo_visitante || 'Visitante';
  
  const localLogo = getTeamLogo(localName);
  const visitaLogo = getTeamLogo(visitaName);

  return (
    <>
      <article 
        className="glass animate-fade-in" 
        style={{ 
          padding: '1.5rem',
          animationDelay: `${index * 0.1}s`,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/820/820556.png" alt="MLB" style={{ width: '16px', height: '16px', filter: 'invert(1)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>MLB</span>
          </div>
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-muted)' }}>
            {prediction.mercado}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src={localLogo} alt={localName} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{localName}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prediction.era_local || '-'}</span>
          </div>
          
          <div style={{ padding: '0 1rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            VS
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src={visitaLogo} alt={visitaName} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{visitaName}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prediction.era_visitante || '-'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            <span style={{ color: 'var(--text-muted)' }}>Predicción: </span>
            <strong style={{ color: 'var(--accent)' }}>{prediction.prediccion}</strong> 
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> (AI: {prob}%)</span>
          </p>
          
          {prediction.resumen_apuesta && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ fontWeight: 600 }}>Análisis: </span>
              {prediction.resumen_apuesta}
            </p>
          )}
        </div>

        <button 
          onClick={() => setShowModal(true)}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem',
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          Ver Análisis Completo
        </button>
      </article>

      {/* Modal de Análisis */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
          padding: '1rem'
        }}
        onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: 'var(--bg-color)',
              border: '1px solid var(--accent)',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              Reporte Completo: {prediction.partido}
            </h3>
            
            {/* Grid de Estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Selección / Pick</p>
                <p style={{ fontWeight: 700, margin: 0, color: 'var(--accent)', fontSize: '1.1rem' }}>{prediction.prediccion}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Mercado: {prediction.mercado}</p>
              </div>
              
              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Datos del Modelo</p>
                <p style={{ fontWeight: 600, margin: 0 }}>Probabilidad: {prob}%</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  Confianza: <span style={{ color: 'var(--accent)' }}>{prediction.confianza}</span>
                </p>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Abridores</p>
                <p style={{ fontWeight: 500, margin: 0, fontSize: '0.9rem' }}>{localName}: {prediction.abridor_local} <span style={{color: 'var(--text-muted)'}}>(ERA: {prediction.era_local || '-'})</span></p>
                <p style={{ fontWeight: 500, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{visitaName}: {prediction.abridor_visitante} <span style={{color: 'var(--text-muted)'}}>(ERA: {prediction.era_visitante || '-'})</span></p>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Marcador Proyectado</p>
                <p style={{ fontWeight: 700, margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{prediction.marcador_proyectado || 'N/A'}</p>
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: '8px', borderLeft: '4px solid var(--accent)', marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Análisis del Tipster / IA</p>
              <p style={{ lineHeight: 1.6, color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                {prediction.resumen_apuesta || 'No hay análisis detallado disponible para este partido.'}
              </p>
            </div>

            {prediction.notas && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                * Notas extra: {prediction.notas}
              </p>
            )}

            <button 
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'transparent',
                color: 'var(--text-main)',
                border: '1px solid var(--card-border)',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cerrar Resumen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
