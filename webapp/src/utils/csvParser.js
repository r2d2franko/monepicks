import Papa from 'papaparse';

export const loadPredictions = async (dateString) => {
  if (!dateString) return [];
  const [year, month, day] = dateString.split('-');
  
  try {
    const response = await fetch(`/data/${year}/${month}/${day}/predicciones_${dateString}_v1.csv`);
    if (!response.ok) {
      console.warn('No hay datos para esta fecha:', dateString);
      return [];
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const normalized = results.data.map(row => {
            let prediccion = row.ganador_proyectado || '';
            let probabilidad = 0;
            
            if (row.mercado === 'Más/Menos carreras') {
              prediccion = `${row.lado_recomendado_ou} ${row.linea_mercado_ou}`;
              probabilidad = row.lado_recomendado_ou === 'OVER' ? row.probabilidad_over_ou : row.probabilidad_under_ou;
            } else if (row.mercado === 'Ganador del partido') {
              prediccion = row.ganador_proyectado;
              probabilidad = row.solidez_modelo;
            } else if (row.mercado && row.mercado.includes('Ponches')) {
              prediccion = `${row.pitcher_ponches} ${row.lado_recomendado_ponches} ${row.linea_mercado_ponches}`;
              probabilidad = row.lado_recomendado_ponches === 'OVER' ? row.probabilidad_over_ponches : row.probabilidad_under_ponches;
            }

            if (typeof probabilidad === 'string') probabilidad = parseFloat(probabilidad.replace('%', ''));
            
            return {
              ...row,
              prediccion_normalizada: prediccion,
              probabilidad_normalizada: Math.round(probabilidad || 0)
            };
          });
          resolve(normalized);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error loading predictions:', error);
    return [];
  }
};
