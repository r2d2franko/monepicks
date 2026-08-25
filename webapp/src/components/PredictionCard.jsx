import { useState } from 'react';
import { getTeamLogo } from '../utils/getMlbLogo';

export function PredictionCard({ prediction, index }) {
  const [showModal, setShowModal] = useState(false);
  const prob = prediction.probabilidad_normalizada || 0;

  const localName = prediction.equipo_local || 'Local';
  const visitaName = prediction.equipo_visitante || 'Visitante';

  const localLogo = getTeamLogo(localName);
  const visitaLogo = getTeamLogo(visitaName);

  const isNoPlay = prediction.isNoPlay || false;
  const isWaiting = prediction.isWaiting || false;

  // Obtener color según evaluación
  const getBadgeColor = (evalText) => {
    if (!evalText) return 'var(--text-muted)';
    if (evalText.includes('⭐⭐⭐⭐⭐')) return 'var(--success)';
    if (evalText.includes('⭐⭐⭐⭐')) return '#3b82f6'; // Azul
    if (evalText.includes('⭐⭐⭐')) return '#8b5cf6'; // Morado
    return 'var(--warning)';
  };

  const badgeColor = getBadgeColor(prediction.evaluacion_es);

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
          overflow: 'hidden',
          opacity: isNoPlay ? 0.7 : 1,
          filter: isNoPlay ? 'grayscale(0.5)' : 'none'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/820/820556.png" alt="MLB" style={{ width: '16px', height: '16px', filter: 'invert(1)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>MLB</span>
            {isNoPlay && (
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: 'var(--danger)', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>
                No Recomendada
              </span>
            )}
            {isWaiting && (
              <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', background: '#f59e0b', color: '#000', borderRadius: '4px', fontWeight: 'bold' }}>
                ⏳ Sin Lanzador
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-muted)' }}>
            {prediction.mercado || prediction.mercado_es}
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{prediction.partido}</p>
          <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-muted)' }}>{prediction.fecha}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src={localLogo} alt={localName} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{localName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
              {prediction.abridor_local || prediction.home_pitcher || 'TBD'} <br/> (ERA: {prediction.era_local ?? prediction.home_era ?? '-'})
            </span>
          </div>
          
          <div style={{ padding: '0 1rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            VS
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <img src={visitaLogo} alt={visitaName} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '0.5rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>{visitaName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
              {prediction.abridor_visitante || prediction.away_pitcher || 'TBD'} <br/> (ERA: {prediction.era_visitante ?? prediction.away_era ?? '-'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {prediction.evaluacion_es && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isNoPlay ? 'var(--danger)' : badgeColor, flexShrink: 0 }}></span>
              <span style={{ fontSize: '0.8rem', color: isNoPlay ? 'var(--danger)' : badgeColor, fontWeight: 600 }}>{prediction.evaluacion_es}</span>
            </div>
          )}

          <p style={{ fontSize: '0.875rem', margin: 0 }}>
            <span style={{ color: 'var(--text-muted)' }}>Pick: </span>
            <strong style={{ color: isNoPlay ? 'var(--text-muted)' : 'var(--accent)' }}>
              {prediction.prediccion_normalizada || 'N/A'}
            </strong>
          </p>

          {!isNoPlay && !isWaiting && prediction.mercado === 'Ganador del partido' ? (
             <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                  Probabilidad: <strong style={{color: 'var(--text-main)'}}>{prediction.probabilidad_pura || 0}%</strong>
                </span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--card-border)' }}>
                  Solidez: <strong style={{color: 'var(--text-main)'}}>{prob}%</strong>
                </span>
             </div>
          ) : !isNoPlay && !isWaiting && (
             <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem', marginBottom: '0.25rem' }}> 
               Probabilidad: {prob}%
             </span>
          )}
          
          {isWaiting && (
            <p style={{ fontSize: '0.85rem', color: '#f59e0b', margin: '0.25rem 0', fontStyle: 'italic' }}>
              ⏳ Pick pendiente: esperando confirmación del lanzador titular.
            </p>
          )}

          {/* Barra de probabilidad visual */}
          {prob > 0 && (
            <div className="prob-bar-wrapper">
              <div
                className="prob-bar-fill"
                style={{
                  width: prob + '%',
                  background: prob >= 75 ? 'var(--success)' : prob >= 55 ? 'var(--warning)' : 'var(--danger)'
                }}
              />
            </div>
          )}

          {/* Estadio */}
          {prediction.estadio && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>📍</span>{prediction.estadio}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{
            marginTop: '1rem',
            width: '100%',
            padding: '0.75rem',
            background: isNoPlay ? 'rgba(255,255,255,0.1)' : 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
            boxShadow: isNoPlay ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.2)'
          }}
          onMouseEnter={(e) => {
            if (!isNoPlay) e.currentTarget.style.background = 'var(--accent-hover)'
          }}
          onMouseLeave={(e) => {
            if (!isNoPlay) e.currentTarget.style.background = 'var(--accent)'
          }}
        >
          {isNoPlay ? 'Ver Datos' : 'Ver Análisis Completo'}
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
              border: `1px solid ${isNoPlay ? 'var(--card-border)' : 'var(--accent)'}`,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-main)' }}>
                Reporte: {prediction.partido}
              </h3>
              {isNoPlay && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--danger)', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }}>NO PLAY</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Selección / Pick</p>
                <p style={{ fontWeight: 700, margin: 0, color: isNoPlay ? 'var(--text-muted)' : 'var(--accent)', fontSize: '1.1rem' }}>
                  {prediction.prediccion_normalizada || 'N/A'}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Mercado: {prediction.mercado_es || prediction.mercado}</p>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Evaluación del Modelo</p>
                <p style={{ fontWeight: 600, margin: 0, color: isNoPlay ? 'var(--danger)' : badgeColor }}>
                  {isNoPlay ? 'NO RECOMENDADO (NO PLAY)' : prediction.evaluacion_es}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  {prediction.mercado === 'Ganador del partido'
                    ? `Probabilidad: ${prediction.probabilidad_pura || 0}% | Solidez del Modelo: ${prob}%`
                    : `Probabilidad: ${prob}% (Solidez: ${prediction.solidez_modelo || 0})`}
                </p>
              </div>

              <div style={{ background: 'var(--card-bg)', padding: '1rem', borderRadius: '8px', gridColumn: '1 / -1' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>Datos Clave del Mercado</p>

                {prediction.mercado === 'Ganador del partido' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid var(--card-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{localName}</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.probabilidad_local || '-'}</span>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{visitaName}</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.probabilidad_visitante || '-'}</span>
                    </div>
                  </div>
                )}

                {prediction.mercado === 'Más/Menos carreras' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid var(--card-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Línea Mercado (O/U)</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.linea_mercado_ou}</span>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Carreras Esperadas</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.total_carreras_esperadas}</span>
                    </div>
                  </div>
                )}

                {prediction.mercado && prediction.mercado.includes('Ponches') && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid var(--card-border)' }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Línea de Ponches ({prediction.pitcher_ponches})</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.linea_mercado_ponches}</span>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ponches Proyectados (IA)</span>
                      <span style={{ fontWeight: 'bold' }}>{prediction.ponches_proyectados}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

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
