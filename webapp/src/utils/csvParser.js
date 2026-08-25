import Papa from 'papaparse';

export const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MARKET_MAP = {
  MONEYLINE: 'Ganador del partido',
  TOTALS: 'Más/Menos carreras',
};

const normalizeNewFormat = (rows) => {
  return rows.map(row => {
    // Derivar equipos desde matchup: "Visitante @ Local"
    const parts = (row.matchup || '').split(' @ ');
    const equipo_visitante = parts[0]?.trim() || '';
    const equipo_local = parts[1]?.trim() || '';

    let mercado = MARKET_MAP[row.market] || row.market;
    let mercado_es = mercado;

    if (row.market?.startsWith('TEAM_TOTAL_')) {
      mercado_es = 'Total de Equipo';
      const isHome = row.market.includes('_HOME_');
      mercado = `Total ${isHome ? 'Local' : 'Visitante'} (${row.market_line})`;
    }
    const status = row.status?.trim();
    const evaluation = row.evaluation?.trim();
    const isWaiting = status === 'WAITING_FOR_STARTER';
    const isNoPlay = evaluation === 'NO_PLAY_PITCHER' || evaluation === 'NO_PLAY';

    // Parsear probabilidades
    let model_prob_num = 0;
    if (row.model_prob && row.model_prob !== 'N/A') {
      model_prob_num = parseFloat(String(row.model_prob).replace('%', '')) || 0;
    }
    let model_conf_num = 0;
    if (row.model_confidence && row.model_confidence !== 'N/A') {
      model_conf_num = parseFloat(row.model_confidence) || 0;
    }

    // Pick normalizado
    let prediccion_normalizada = row.pick || '';
    if ((row.market === 'TOTALS' || row.market?.startsWith('TEAM_TOTAL_')) && row.pick !== 'N/A' && row.market_line && row.market_line !== 'N/A') {
      prediccion_normalizada = `${row.pick} ${row.market_line}`;
    }

    // Para Moneyline: probabilidad_pura = model_prob (del equipo elegido)
    // Para Totals: probabilidad_pura no aplica
    const probabilidad_pura = row.market === 'MONEYLINE' ? Math.round(model_prob_num) : null;

    // La "probabilidad_normalizada" que usa la barra de la card:
    // - MONEYLINE: solidez (model_confidence) para la barra
    // - TOTALS: probabilidad del over/under (model_prob)
    const probabilidad_normalizada = row.market === 'MONEYLINE'
      ? Math.round(model_conf_num)
      : Math.round(model_prob_num);

    return {
      // Campos originales del CSV
      ...row,
      // Campos derivados / normalizados para la UI
      equipo_local,
      equipo_visitante,
      mercado,
      mercado_es,
      partido: row.matchup || '',
      abridor_local: row.home_pitcher || '',
      abridor_visitante: row.away_pitcher || '',
      era_local: row.home_era || '-',
      era_visitante: row.away_era || '-',
      evaluacion_es: row.evaluation_es || '',
      fecha: row.date || '',
      solidez_modelo: model_conf_num,
      prediccion_normalizada,
      probabilidad_normalizada,
      probabilidad_pura,
      isWaiting,
      isNoPlay,
    };
  });
};

export const loadPredictions = async (dateString) => {
  if (!dateString) return [];
  const [year, month, day] = dateString.split('-');

  // Intentar nuevo formato primero, luego viejo (_v1)
  const pathsToTry = [
    `/data/${year}/${month}/${day}/predicciones_${dateString}.csv`,
    `/data/${year}/${month}/${day}/predicciones_${dateString}_v1.csv`,
  ];

  for (const path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const csvText = await response.text();
      if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) continue;

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Detectar formato por presencia de columna 'market' (nuevo) vs 'mercado' (viejo)
            const isNewFormat = results.meta.fields?.includes('market');
            let normalized;
            if (isNewFormat) {
              normalized = normalizeNewFormat(results.data);
            } else {
              // Formato viejo (compatibilidad mínima)
              normalized = results.data.map(row => {
                let prediccion = row.ganador_proyectado || '';
                let probabilidad = 0;
                let probabilidad_pura = null;
                if (row.mercado === 'Más/Menos carreras') {
                  prediccion = `${row.lado_recomendado_ou} ${row.linea_mercado_ou}`;
                  probabilidad = row.lado_recomendado_ou === 'OVER' ? row.probabilidad_over_ou : row.probabilidad_under_ou;
                } else if (row.mercado === 'Ganador del partido') {
                  prediccion = row.ganador_proyectado;
                  probabilidad = row.solidez_modelo;
                  probabilidad_pura = prediccion === row.equipo_local ? row.probabilidad_local : row.probabilidad_visitante;
                } else if (row.mercado && row.mercado.includes('Ponches')) {
                  prediccion = `${row.pitcher_ponches} ${row.lado_recomendado_ponches} ${row.linea_mercado_ponches}`;
                  probabilidad = row.lado_recomendado_ponches === 'OVER' ? row.probabilidad_over_ponches : row.probabilidad_under_ponches;
                }
                if (typeof probabilidad === 'string') probabilidad = parseFloat(probabilidad.replace('%', ''));
                if (typeof probabilidad_pura === 'string') probabilidad_pura = parseFloat(probabilidad_pura.replace('%', ''));
                return {
                  ...row,
                  mercado_es: row.mercado,
                  partido: row.matchup || `${row.equipo_visitante} @ ${row.equipo_local}`,
                  prediccion_normalizada: prediccion,
                  probabilidad_normalizada: Math.round(probabilidad || 0),
                  probabilidad_pura: probabilidad_pura ? Math.round(probabilidad_pura) : null,
                  isWaiting: false,
                  isNoPlay: row.apuesta === 'NO_PLAY',
                };
              });
            }
            resolve(normalized);
          },
          error: (error) => reject(error)
        });
      });
    } catch (e) {
      // Ignorar, probar siguiente
    }
  }

  console.warn('No hay datos para esta fecha:', dateString);
  return [];
};


// Fecha de corte: a partir de aquí los resultados viven en el CSV de predicciones
const NEW_FORMAT_CUTOFF = '2026-08-24';

// Normaliza filas del nuevo CSV de predicciones para que AccuracyDashboard las entienda
const normalizeAccuracyFromPredictions = (rows) => {
  return rows
    .filter(row => ['WIN', 'LOSS', 'PUSH'].includes(row.status?.trim()))
    .map(row => {
      const parts = (row.matchup || '').split(' @ ');
      const equipo_visitante = parts[0]?.trim() || '';
      const equipo_local = parts[1]?.trim() || '';

      let prob = 0;
      if (row.model_prob && row.model_prob !== 'N/A') {
        prob = parseFloat(String(row.model_prob).replace('%', '')) || 0;
      }

      const status = row.status?.trim();
      const is_correct = status === 'WIN';
      const is_push = status === 'PUSH';

      // target: para MONEYLINE es el equipo, para TOTALS es OVER/UNDER
      const target = row.pick || '';

      return {
        ...row,
        equipo_local,
        equipo_visitante,
        market: row.market,
        matchup: row.matchup,
        target,
        probability_pct: prob,
        line_value: row.market_line !== 'N/A' ? parseFloat(row.market_line) || 0 : 0,
        actual_value: row.actual_score || '',
        actual_outcome: row.actual_result || '',
        is_correct,
        is_push,
      };
    });
};

export const loadAccuracy = async (dateString) => {
  if (!dateString) return [];

  // Detección automática de formato por fecha de corte
  const isNewFormat = dateString >= NEW_FORMAT_CUTOFF;

  if (isNewFormat) {
    // NUEVO: leer desde el CSV de predicciones y filtrar por status
    const [year, month, day] = dateString.split('-');
    const pathsToTry = [
      `/data/${year}/${month}/${day}/predicciones_${dateString}.csv`,
      `/data/${year}/${month}/${day}/predicciones_${dateString}_v1.csv`,
    ];

    for (const path of pathsToTry) {
      try {
        const response = await fetch(path);
        if (!response.ok) continue;
        const csvText = await response.text();
        if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) continue;

        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              resolve(normalizeAccuracyFromPredictions(results.data));
            },
            error: reject
          });
        });
      } catch (e) { /* ignorar */ }
    }

    console.warn('No hay datos de predicciones para esta fecha:', dateString);
    return [];
  }

  // HISTÓRICO: leer desde el archivo de accuracy separado
  const [year, month, day] = dateString.split('-');
  const compactDate = `${year}${month}${day}`;

  const nextDayDate = new Date(dateString + 'T12:00:00');
  nextDayDate.setDate(nextDayDate.getDate() + 1);
  const nextYear = nextDayDate.getFullYear();
  const nextMonth = String(nextDayDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDayDate.getDate()).padStart(2, '0');

  const pathsToTry = [
    `/accuracy/${year}/${month}/${day}/accuracy_${compactDate}.csv`,
    `/accuracy/${nextYear}/${nextMonth}/${nextDay}/accuracy_${compactDate}.csv`,
  ];

  for (let path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const csvText = await response.text();
        if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) continue;
        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const parsed = results.data.map(row => ({
                ...row,
                is_correct: row.is_correct === 'True',
                is_push: row.is_push === 'True',
                probability_pct: parseFloat(row.probability_pct)
              }));
              resolve(parsed);
            },
            error: reject
          });
        });
      }
    } catch (e) { /* ignorar */ }
  }

  console.warn('No se encontraron resultados de accuracy para la fecha:', dateString);
  return [];
};

