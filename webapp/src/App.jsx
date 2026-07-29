import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { PredictionCard } from './components/PredictionCard';
import { AdBanner } from './components/AdBanner';
import { loadPredictions } from './utils/csvParser';
import { Search, Calendar } from 'lucide-react';
import './styles/global.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadPredictions();
      setPredictions(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Obtener fechas únicas para el filtro
  const uniqueDates = [...new Set(predictions.map(p => p.fecha))].filter(Boolean);

  // Filtrar predicciones
  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = pred.partido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.equipo_local?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pred.equipo_visitante?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate ? pred.fecha === selectedDate : true;
    return matchesSearch && matchesDate;
  });

  // Las predicciones filtradas ya las tenemos en filteredPredictions

  return (
    <>
      <Header />
      <main className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--accent)' }}>
            <div className="animate-fade-in" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Cargando predicciones...
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Mejores Picks de Hoy
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Análisis basado en modelos predictivos y estadísticas recientes.
                </p>
              </div>

              {/* Filtros */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 1rem', flex: '1 1 300px'
                }}>
                  <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                  <input
                    type="text"
                    placeholder="Buscar equipo o partido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--text-main)',
                      outline: 'none', width: '100%', fontSize: '0.875rem'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0.5rem 1rem', flex: '1 1 200px'
                }}>
                  <Calendar size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      background: 'transparent', border: 'none', color: 'var(--text-main)',
                      outline: 'none', width: '100%', fontSize: '0.875rem', cursor: 'pointer'
                    }}
                  >
                    <option value="" style={{ background: 'var(--bg-color)' }}>Todas las fechas</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date} style={{ background: 'var(--bg-color)' }}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="main-layout">
              <div className="grid-cards" style={{ marginTop: 0 }}>
                {filteredPredictions.map((pred, index) => (
                  <PredictionCard key={`pred-${index}`} prediction={pred} index={index} />
                ))}
              </div>
              
              <aside style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <AdBanner />
                <AdBanner />
              </aside>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default App;
