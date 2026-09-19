/**
 * ScenarioSystem - Determina el escenario base según el número de nivel.
 * 
 * Según Modelo de Datos §54 y Especificación Maestra §22:
 * - Niveles 1-100: Bloques de 10 niveles por escenario.
 * - Niveles 101+: Basado en el último dígito.
 */
export class ScenarioSystem {
  /**
   * Obtiene el ID del escenario para un nivel dado.
   * @param {number} levelNumber 
   * @returns {number} ID de escenario (1-10)
   */
  static getScenario(levelNumber) {
    if (levelNumber < 1) throw new Error('El número de nivel debe ser >= 1');

    if (levelNumber <= 100) {
      // 1-10 -> 1, 11-20 -> 2, ..., 91-100 -> 10
      return Math.ceil(levelNumber / 10);
    } else {
      // 101+ -> último dígito (0 -> 10)
      const lastDigit = levelNumber % 10;
      return lastDigit === 0 ? 10 : lastDigit;
    }
  }

  /**
   * Obtiene una descripción básica del escenario (para depuración/UI futura).
   * @param {number} scenarioId 
   * @returns {string}
   */
  static getScenarioDescription(scenarioId) {
    const descriptions = {
      1: "Todo fijo. Capas variables. Especial 1.",
      2: "Todo fijo. Estantes únicos. Capas variables.",
      3: "Mixto. Movimiento vertical 1.",
      4: "Mixto. Movimiento horizontal 1.",
      5: "Mezcla total. Especial total 1.",
      6: "Todo fijo. Capas variables. Especial 2.",
      7: "Todo fijo. Estantes únicos. Capas 2.",
      8: "Mixto. Movimiento vertical 2.",
      9: "Mixto. Movimiento horizontal 2.",
      10: "Estanterías con desplome. Especial total 2."
    };
    return descriptions[scenarioId] || "Escenario desconocido";
  }
}