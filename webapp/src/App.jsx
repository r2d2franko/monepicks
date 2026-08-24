import React, { useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { PredictionCard } from './components/PredictionCard';
import { AdBanner } from './components/AdBanner';
import { AccuracyDashboard } from './components/AccuracyDashboard';
import { loadPredictions, getLocalDateString } from './utils/csvParser';
import { getTeamLogo } from './utils/getMlbLogo';
import { Search, Calendar, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import './styles/global.css';

// Mapeo de mercados a etiquetas legibles y chips
const MARKET_CHIPS = [
  { label: 'Todos', value: 'all' },
  { label: '🏆 Ganador', value: 'Ganador del partido' },
  { label: '📊 Más/Menos', value: 'Más/Menos carreras' },
  { label: '⚾ Ponches', value: 'ponches' }, // cubre Ponches (Local) y Ponches (Visitante)
];

const STAR_CHIPS = [
  { label: 'Todas', value: 'all' },
  { label: '⭐⭐⭐⭐⭐ Favorito', value: '⭐⭐⭐⭐⭐' },
  { label: '⭐⭐⭐⭐ Favorable', value: '⭐⭐⭐⭐ ' },
  { label: '⭐⭐⭐ Ligera', value: '⭐⭐⭐ ' },
  { label: '⭐ Cerrado', value: '⭐ ' },
];

// Skeleton Loader
function SkeletonCard() {
  return (
    <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRadius: '16px' }}>
      <div className="skeleton" style={{ height: '14px', width: '60%' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: '80px', height: '12px' }} />
        </div>
        <div className="skeleton" style={{ width: '30px', height: '24px', alignSelf: 'center' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: '80px', height: '12px' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: '14px', width: '90%' }} />
      <div className="skeleton" style={{ height: '40px', borderRadius: '8px' }} />
    </div>
  );
}

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [marketFilter, setMarketFilter] = useState('all');
  const [starFilter, setStarFilter] = useState('all');
  const [hideNoPlay, setHideNoPlay] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [currentView, setCurrentView] = useState('predictions'); // 'predictions' o 'accuracy'
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await loadPredictions(selectedDate);
      setPredictions(data);
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);

  // Stats del día (calculadas sobre datos crudos, sin filtros)
  const stats = useMemo(() => {
    const total = predictions.length;
    const fav5 = predictions.filter(p => p.evaluacion_es && p.evaluacion_es.startsWith('⭐⭐⭐⭐⭐')).length;
    const noPlay = predictions.filter(p => p.evaluacion_es && p.evaluacion_es.startsWith('NO_PLAY')).length;
    const ganador = predictions.filter(p => p.mercado === 'Ganador del partido').length;
    const ponches = predictions.filter(p => p.mercado && p.mercado.includes('Ponches')).length;
    return { total, fav5, noPlay, ganador, ponches };
  }, [predictions]);

  // Equipos únicos del día
  const uniqueTeams = useMemo(() => {
    const teams = new Set();
    predictions.forEach(p => {
      if (p.equipo_local) teams.add(p.equipo_local);
      if (p.equipo_visitante) teams.add(p.equipo_visitante);
    });
    return Array.from(teams).sort();
  }, [predictions]);

  // Filtrado y ordenamiento
  const filteredPredictions = useMemo(() => {
    let result = predictions;

    // Ocultar NO_PLAY (y opcionalmente WAITING)
    if (hideNoPlay) result = result.filter(p => !p.isNoPlay);

    // Filtro por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.partido?.toLowerCase().includes(term) ||
        p.equipo_local?.toLowerCase().includes(term) ||
        p.equipo_visitante?.toLowerCase().includes(term)
      );
    }

    // Filtro por mercado
    if (marketFilter !== 'all') {
      if (marketFilter === 'ponches') {
        result = result.filter(p => p.mercado && p.mercado.includes('Ponches'));
      } else {
        result = result.filter(p => p.mercado === marketFilter || p.mercado_es === marketFilter);
      }
    }

    // Filtro por equipo
    if (teamFilter !== 'all') {
      result = result.filter(p => p.equipo_local === teamFilter || p.equipo_visitante === teamFilter);
    }

    // Filtro por estrellas
    if (starFilter !== 'all') {
      result = result.filter(p => p.evaluacion_es && p.evaluacion_es.startsWith(starFilter));
    }

    // Ordenamiento
    if (sortBy === 'prob-desc') {
      result = [...result].sort((a, b) => (b.probabilidad_normalizada || 0) - (a.probabilidad_normalizada || 0));
    } else if (sortBy === 'stars-desc') {
      const starCount = (s) => (s?.match(/⭐/g) || []).length;
      result = [...result].sort((a, b) => starCount(b.evaluacion_es) - starCount(a.evaluacion_es));
    } else if (sortBy === 'market') {
      const order = { 'Ganador del partido': 0, 'Más/Menos carreras': 1 };
      result = [...result].sort((a, b) => {
        const ai = a.mercado?.includes('Ponches') ? 2 : (order[a.mercado] ?? 3);
        const bi = b.mercado?.includes('Ponches') ? 2 : (order[b.mercado] ?? 3);
        return ai - bi;
      });
    } else if (sortBy === 'partido') {
      result = [...result].sort((a, b) => (a.partido || '').localeCompare(b.partido || ''));
    }

    return result;
  }, [predictions, searchTerm, marketFilter, starFilter, hideNoPlay, sortBy, teamFilter]);

  return (
    <>
      <Header />

      {/* Tabs Navigation */}
      <div style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)', padding: '0 2rem' }}>
        <div className="container" style={{ padding: '0', display: 'flex', gap: '2rem' }}>
          <button
            onClick={() => setCurrentView('predictions')}
            style={{
              background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
              color: currentView === 'predictions' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: currentView === 'predictions' ? 700 : 500,
              borderBottom: currentView === 'predictions' ? '3px solid var(--accent)' : '3px solid transparent',
              fontSize: '1rem', transition: 'all 0.2s'
            }}
          >
            🔮 Predicciones de Hoy
          </button>
          <button
            onClick={() => setCurrentView('accuracy')}
            style={{
              background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
              color: currentView === 'accuracy' ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: currentView === 'accuracy' ? 700 : 500,
              borderBottom: currentView === 'accuracy' ? '3px solid var(--accent)' : '3px solid transparent',
              fontSize: '1rem', transition: 'all 0.2s'
            }}
          >
            📊 Resultados (Accuracy)
          </button>
        </div>
      </div>

      <main className="container" style={{ paddingTop: '2rem' }}>
        {currentView === 'accuracy' ? (
          <AccuracyDashboard />
        ) : (
          <>
            {/* STATS BAR */}
            {!loading && predictions.length > 0 && (
              <div className="stats-bar animate-fade-in">
                <div className="stat-item">
                  📊 <span className="stat-value">{stats.total}</span> Picks Analizados
                </div>
                <div className="stat-item">
                  ⭐⭐⭐⭐⭐ <span className="stat-value" style={{ color: 'var(--success)' }}>{stats.fav5}</span> Favoritos
                </div>
                <div className="stat-item">
                  🏆 <span className="stat-value">{stats.ganador}</span> Ganador
                </div>
                <div className="stat-item">
                  ⚾ <span className="stat-value">{stats.ponches}</span> Ponches
                </div>
                <div className="stat-item">
                  🔴 <span className="stat-value" style={{ color: 'var(--danger)' }}>{stats.noPlay}</span> No Play
                </div>
              </div>
            )}

            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Mejores Picks de Hoy
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Análisis basado en modelos predictivos y estadísticas recientes.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ArrowUpDown size={15} color="var(--text-muted)" />
                  <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="default">Orden por defecto</option>
                    <option value="stars-desc">⭐ Mayor confianza</option>
                    <option value="prob-desc">% Mayor probabilidad</option>
                    <option value="market">Por mercado</option>
                    <option value="partido">Por partido (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Búsqueda y fecha */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 1rem', flex: '1 1 280px'
                }}>
                  <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Buscar equipo o partido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                  />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 1rem', flex: '0 1 200px'
                }}>
                  <Calendar size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.875rem', cursor: 'pointer', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Filtros por mercado, evaluación y NO PLAY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Mercados */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '80px' }}>Mercado:</span>
                  <div className="filter-chips">
                    {MARKET_CHIPS.map(c => (
                      <button
                        key={c.value}
                        className={'chip' + (marketFilter === c.value ? ' active' : '')}
                        onClick={() => setMarketFilter(c.value)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confianza / Evaluación */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '80px' }}>Evaluación:</span>
                  <div className="filter-chips">
                    {STAR_CHIPS.map(c => (
                      <button
                        key={c.value}
                        className={'chip' + (starFilter === c.value ? ' active' : '')}
                        onClick={() => setStarFilter(c.value)}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mostrar / Ocultar NO PLAY */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '80px' }}>Opciones:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <input
                      type="checkbox"
                      checked={!hideNoPlay}
                      onChange={(e) => setHideNoPlay(!e.target.checked)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: 'var(--accent)',
                        cursor: 'pointer'
                      }}
                    />
                    <span>Mostrar picks marcados como <strong style={{ color: 'var(--danger)' }}>NO PLAY</strong></span>
                  </label>
                </div>

                {/* Filtro por equipo (Logos) */}
                {uniqueTeams.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '80px' }}>Equipo:</span>
                    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => setTeamFilter('all')}
                        style={{
                          background: teamFilter === 'all' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                          color: teamFilter === 'all' ? '#fff' : 'var(--text-muted)',
                          border: '1px solid', borderColor: teamFilter === 'all' ? 'var(--accent)' : 'var(--card-border)',
                          padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap'
                        }}
                      >
                        Todos
                      </button>
                      {uniqueTeams.map(team => (
                        <button
                          key={team}
                          onClick={() => setTeamFilter(team === teamFilter ? 'all' : team)}
                          title={team}
                          style={{
                            background: teamFilter === team ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: `2px solid ${teamFilter === team ? 'var(--accent)' : 'transparent'}`,
                            borderRadius: '50%', padding: '0.2rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                          }}
                        >
                          <img src={getTeamLogo(team)} alt={team} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Contador de resultados */}
              {!loading && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Mostrando <strong style={{ color: 'var(--text-main)' }}>{filteredPredictions.length}</strong> picks
                </p>
              )}
            </div>

            {/* Contenido principal */}
            <div className="main-layout">
              <div className="grid-cards" style={{ marginTop: 0 }}>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredPredictions.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">⚾</span>
                    <h3>Sin picks disponibles</h3>
                    <p>
                      No hay predicciones para la fecha y filtros seleccionados.<br />
                      Intenta cambiar la fecha o ajustar los filtros.
                    </p>
                  </div>
                ) : (
                  filteredPredictions.map((pred, index) => (
                    <PredictionCard key={`pred-${pred.id}-${pred.mercado}-${index}`} prediction={pred} index={index} />
                  ))
                )}
              </div>

              <aside style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <AdBanner htmlFile="2.html" width={160} height={300} />
                <AdBanner htmlFile="1.html" width={160} height={600} />
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
