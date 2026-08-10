import Papa from 'papaparse';

export const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
    
    // Evitar fallback SPA
    if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) {
      console.warn('No hay datos para esta fecha:', dateString);
      return [];
    }
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const normalized = results.data.map(row => {
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
              prediccion_normalizada: prediccion,
              probabilidad_normalizada: Math.round(probabilidad || 0),
              probabilidad_pura: probabilidad_pura ? Math.round(probabilidad_pura) : null
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

export const loadAccuracy = async (dateString) => {
  if (!dateString) return [];
  const [year, month, day] = dateString.split('-');
  const compactDate = `${year}${month}${day}`;
  
  // Como a veces el archivo del día 06 se genera en la carpeta del día 07, 
  // intentaremos primero la carpeta del día exacto, y si falla, la del día siguiente.
  let pathsToTry = [
    `/accuracy/${year}/${month}/${day}/accuracy_${compactDate}.csv`
  ];
  
  const nextDayDate = new Date(dateString);
  nextDayDate.setDate(nextDayDate.getDate() + 1);
  const nextYear = nextDayDate.getFullYear();
  const nextMonth = String(nextDayDate.getMonth() + 1).padStart(2, '0');
  const nextDay = String(nextDayDate.getDate()).padStart(2, '0');
  pathsToTry.push(`/accuracy/${nextYear}/${nextMonth}/${nextDay}/accuracy_${compactDate}.csv`);

  for (let path of pathsToTry) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const csvText = await response.text();
        
        // Evitar que el servidor devuelva el index.html cuando el archivo no existe (SPA fallback)
        if (csvText.trim().toLowerCase().startsWith('<!doctype html>')) {
          continue; // Probar la siguiente ruta
        }

        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              // Parse boolean strings to actual booleans
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
    } catch (e) {
      // Ignorar e intentar el siguiente
    }
  }
  
  console.warn('No se encontraron resultados de accuracy para la fecha:', dateString);
  return [];
};
