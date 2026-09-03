import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, Search } from 'lucide-react';
import { loadAccuracy, getLocalDateString } from '../utils/csvParser';
import { getTeamLogo } from '../utils/getMlbLogo';

export function AccuracyDashboard() {
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  useEffect(() => {
    const fetchAccuracy = async () => {
      setLoading(true);
      const data = await loadAccuracy(selectedDate);
      setResults(data);
      setLoading(false);
    };
    fetchAccuracy();
  }, [selectedDate]);

  const uniqueTeams = useMemo(() => {
    const teams = new Set();
    results.forEach(r => {
      if (r.matchup) {
        const parts = r.matchup.split(' @ ');
        if (parts.length === 2) {
          teams.add(parts[0]);
          teams.add(parts[1]);
        }
      }
    });
    return Array.from(teams).sort();
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = results;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => r.matchup?.toLowerCase().includes(term));
    }
    if (marketFilter !== 'all') {
      filtered = filtered.filter(r => r.market === marketFilter);
    }
    if (teamFilter !== 'all') {
      filtered = filtered.filter(r => r.matchup?.includes(teamFilter));
    }
    return filtered;
  }, [results, searchTerm, marketFilter, teamFilter]);

  const marketChips = useMemo(() => {
    const markets = new Set();
    results.forEach(r => {
      if (r.market) markets.add(r.market);
    });
    return ['all', ...Array.from(markets).sort()];
  }, [results]);

  const getMarketLabel = (market) => {
    if (market === 'all') return 'Todos';
    if (market === 'MONEYLINE') return '🏆 Ganador';
    if (market === 'TOTALS') return '📊 O/U';
    if (market?.startsWith('TEAM_TOTAL_')) return '🎯 Total Eq.';
    if (market?.includes('Ponches')) return '⚾ Ponches';
    return `🆕 ${market}`;
  };

  const stats = useMemo(() => {
    // Para el nuevo formato, is_push y is_correct ya vienen como booleanos correctos
    // Para el histórico, también vienen parseados
    const valid = filteredResults.filter(r => !r.is_push && (r.actual_outcome || r.actual_result));
    const total = valid.length;
    const correct = valid.filter(r => r.is_correct).length;
    const incorrect = total - correct;
    const winRate = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
    const pushes = filteredResults.filter(r => r.is_push).length;

    // Filtramos la base por búsqueda y por equipo, pero no por el tipo de mercado, para poder calcular
    // los porcentajes individuales independientemente del filtro de mercado seleccionado.
    const baseWithTeamAndSearch = results.filter(r => {
      if (searchTerm && !r.matchup?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (teamFilter !== 'all' && !r.matchup?.includes(teamFilter)) return false;
      return true;
    });

    const markets = new Set();
    baseWithTeamAndSearch.forEach(r => {
      if (r.market) markets.add(r.market);
    });
    
    const marketStats = [];
    markets.forEach(m => {
      const mValid = baseWithTeamAndSearch.filter(r => r.market === m && !r.is_push && (r.actual_outcome || r.actual_result));
      const mCorrect = mValid.filter(r => r.is_correct).length;
      const mWinRate = mValid.length > 0 ? Math.round((mCorrect / mValid.length) * 100) : 0;
      marketStats.push({
        market: m,
        winRate: mWinRate,
        total: mValid.length
      });
    });
    marketStats.sort((a, b) => b.total - a.total); // Sort by volume

    return { 
      total, 
      correct, 
      incorrect, 
      winRate, 
      pushes, 
      marketStats
    };
  }, [results, filteredResults, searchTerm, teamFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Controles: Buscador y Fecha */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', background: 'var(--card-bg)',
          border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 1rem', flex: '1 1 280px'
        }}>
          <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar por partido..."
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

      {/* Filtros Secundarios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Filtros de Mercado */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {marketChips.map(market => (
            <button
              key={market}
              onClick={() => setMarketFilter(market)}
              className="chip"
              style={{
                background: marketFilter === market ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                color: marketFilter === market ? '#fff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: marketFilter === market ? 'var(--accent)' : 'var(--card-border)',
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              {getMarketLabel(market)}
            </button>
          ))}
        </div>

        {/* Carrusel de Equipos */}
        {uniqueTeams.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>Filtro por Equipo:</span>

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
        )}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="skeleton" style={{ width: '100%', height: '300px' }} />
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📊</span>
          <h3>Sin Resultados para esta Fecha</h3>
          <p>Aún no se han publicado los resultados de precisión (accuracy) para el día seleccionado. Intenta con un día anterior.</p>
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="stats-bar animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'var(--card-bg)' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Win Rate Global</p>
              <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: stats.winRate >= 55 ? 'var(--success)' : 'var(--text-main)' }}>
                {stats.winRate}%
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Picks Evaluados</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aciertos</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>✅ {stats.correct}</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fallos</p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--danger)' }}>❌ {stats.incorrect}</p>
            </div>
            
            {stats.marketStats.map(ms => (
              <div key={ms.market} style={{ textAlign: 'center', padding: '0.5rem' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>WR {getMarketLabel(ms.market)}</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>{ms.winRate}% <span style={{ fontSize: '0.8rem' }}>({ms.total})</span></p>
              </div>
            ))}
          </div>

          {/* Tabla Moderna */}
          <div className="accuracy-table-container animate-fade-in glass">
            <table className="accuracy-table">
              <thead>
                <tr>
                  <th>Partido</th>
                  <th>Mercado</th>
                  <th>Nuestra Predicción</th>
                  <th>Línea / Val Real</th>
                  <th>Resultado Final</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, i) => {
                  const parts = r.matchup ? r.matchup.split(' @ ') : [];
                  const awayTeam = parts[0] || '';
                  const homeTeam = parts[1] || '';

                  const renderTarget = (val) => {
                    if (!val) return '-';
                    if (r.market === 'MONEYLINE') {
                      const teamName = val === 'home' ? homeTeam : (val === 'away' ? awayTeam : val);
                      if (teamName === homeTeam || teamName === awayTeam) {
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={getTeamLogo(teamName)} alt={teamName} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                            <strong style={{ color: 'var(--text-main)' }}>{teamName}</strong>
                          </div>
                        );
                      }
                    } else if (r.market === 'TOTALS') {
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '1.2rem', color: val === 'OVER' ? 'var(--success)' : 'var(--danger)' }}>
                            {val === 'OVER' ? '⬆️' : '⬇️'}
                          </span>
                          <strong style={{ color: 'var(--text-main)' }}>{val}</strong>
                        </div>
                      );
                    }
                    return <strong style={{ color: 'var(--text-main)' }}>{val}</strong>;
                  };

                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{r.matchup}</td>
                      <td>
                        <span className="market-badge">
                          {getMarketLabel(r.market)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {renderTarget(r.target)}
                          {r.probability_pct && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({r.probability_pct}%)</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {r.line_value > 0 && <span style={{ color: 'var(--text-muted)', marginRight: '6px', display: 'block', fontSize: '0.8rem' }}>Línea: {r.line_value}</span>}
                        {/* actual_value puede ser marcador texto (nuevo) o número (histórico) */}
                        {r.actual_value !== undefined && r.actual_value !== '' && (
                          <span style={{ fontWeight: 600 }}>{r.actual_value}</span>
                        )}
                      </td>
                      <td>
                        {/* actual_outcome: texto del resultado (nuevo) o home/away/OVER/UNDER (histórico) */}
                        {r.actual_outcome
                          ? <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.actual_outcome}</span>
                          : renderTarget(r.actual_outcome)}
                      </td>
                      <td>
                        {r.is_push ? (
                          <span className="result-badge push">➖</span>
                        ) : r.is_correct ? (
                          <span className="result-badge win">✅</span>
                        ) : (
                          <span className="result-badge loss">❌</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
