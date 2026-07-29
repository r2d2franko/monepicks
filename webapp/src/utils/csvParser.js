import Papa from 'papaparse';

export const loadPredictions = async () => {
  try {
    const response = await fetch('/data/Predicciones_MLB.csv');
    if (!response.ok) {
      throw new Error('No se pudo cargar el archivo CSV');
    }
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
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
