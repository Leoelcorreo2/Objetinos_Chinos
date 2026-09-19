/**
 * LevelConfiguration - Representa la configuración calculada para un nivel.
 * 
 * Según Modelo de Datos §50 y Plan de Implementación §13.3:
 * - Combina DifficultyProfile y ScenarioId.
 * - Sirve como entrada para el LevelGenerator.
 */
import { DifficultySystem } from '../difficulty/DifficultySystem.js';
import { ScenarioSystem } from '../scenarios/ScenarioSystem.js';

export class LevelConfiguration {
  /**
   * @param {number} levelNumber 
   */
  constructor(levelNumber) {
    this.levelNumber = levelNumber;
    this.difficulty = DifficultySystem.getProfile(levelNumber);
    this.scenarioId = ScenarioSystem.getScenario(levelNumber);
    this.scenarioDescription = ScenarioSystem.getScenarioDescription(this.scenarioId);
    
    // Validación básica
    this._validate();
  }

  _validate() {
    if (this.difficulty.trioCount < 1) {
      throw new Error('Un nivel debe tener al menos 1 trío');
    }
    if (this.difficulty.layerCount < 1) {
      throw new Error('Un nivel debe tener al menos 1 capa');
    }
    if (this.scenarioId < 1 || this.scenarioId > 10) {
      throw new Error('ID de escenario fuera de rango (1-10)');
    }
  }

  /**
   * Serialización para depuración o guardado futuro
   */
  toJSON() {
    return {
      levelNumber: this.levelNumber,
      difficulty: this.difficulty,
      scenarioId: this.scenarioId,
      scenarioDescription: this.scenarioDescription
    };
  }
}