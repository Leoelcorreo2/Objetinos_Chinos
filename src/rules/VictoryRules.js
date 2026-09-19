/**
 * VictoryRules - Determina si se ha ganado el nivel.
 * Según Modelo de Datos §80: totalObjects = 0
 */
export const VictoryRules = {
  isVictory(levelState) {
    return levelState.getRemainingObjects() === 0;
  }
};