/**
 * DifficultySystem - Transforma el número de nivel en un DifficultyProfile.
 * 
 * Según Modelo de Datos §51-52 y Especificación Maestra §20:
 * - La dificultad se deriva automáticamente del número de nivel.
 * - Define hitos de progresión (capas, especiales, bloqueados, tiempo).
 */
export class DifficultySystem {
  /**
   * Calcula el perfil de dificultad para un nivel dado.
   * @param {number} levelNumber - Número de nivel (>= 1)
   * @returns {Object} DifficultyProfile
   */
  static getProfile(levelNumber) {
    if (levelNumber < 1) throw new Error('El número de nivel debe ser >= 1');

    // Curva base (ajustable, valores iniciales razonables)
    let profile = {
      level: levelNumber,
      trioCount: 2 + Math.floor(levelNumber * 0.5), // Crece progresivamente
      layerCount: 1 + Math.floor((levelNumber - 1) / 25), // +1 capa cada 25 niveles (§20)
      time: 60 + (levelNumber * 5), // Tiempo base + 5s por nivel
      blockedObjects: 0,
      specialObjects: 0,
      powerUpReward: false,
      lifeReward: false,
      restoreLives: false,
      restorePowerUps: false
    };

    // Hitos de dificultad (§20)
    // Cada 50 niveles
    if (levelNumber > 0 && levelNumber % 50 === 0) {
      profile.layerCount += 1;
      profile.specialObjects += 1;
      profile.powerUpReward = true;
      profile.lifeReward = true;
    }

    // Cada 100 niveles
    if (levelNumber > 0 && levelNumber % 100 === 0) {
      profile.blockedObjects += 1;
    }

    // Cada 1000 niveles
    if (levelNumber > 0 && levelNumber % 1000 === 0) {
      profile.restoreLives = true;
      profile.restorePowerUps = true;
    }

    return profile;
  }
}