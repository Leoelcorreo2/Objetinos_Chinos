/**
 * LevelDefinition - Define cómo debe ser un nivel.
 * 
 * Según Modelo de Datos §47-49:
 * - LevelDefinition describe cómo debe ser un nivel (PLANTILLA INMUTABLE)
 * - LevelState describe cómo está ese nivel en un momento concreto (INSTANCIA VIVA)
 * 
 * §44: Reiniciar un nivel NO significa deshacer movimientos.
 * El nivel se reconstruye a partir de su definición.
 * 
 * §49: Una definición de nivel contiene los datos necesarios para construir el nivel.
 * Puede incluir: level, difficulty, scenario, configuration, board definition, solution information, validation information
 */
import { StructureDefinition } from './StructureDefinition.js';

export class LevelDefinition {
  /**
   * @param {number} levelNumber - Número de nivel
   * @param {Array<StructureDefinition>} structures - Estructuras del tablero
   * @param {Object} objects - Mapa de objetos {id: {type, color, blocked, special, specialType}}
   * @param {number} timer - Tiempo inicial en segundos
   * @param {Object} configuration - Configuración adicional (difficulty, scenario, etc.)
   */
  constructor(levelNumber, structures = [], objects = {}, timer = 120, configuration = {}) {
    this.levelNumber = levelNumber;
    this.structures = structures;
    this.objects = objects; // { 'obj_1': {type: 'APPLE', color: 'RED', blocked: false, special: false, specialType: 'NONE'}, ... }
    this.timer = timer;
    this.configuration = configuration;
  }

  /**
   * Serialización para persistencia futura (§85)
   */
  toJSON() {
    return {
      levelNumber: this.levelNumber,
      structures: this.structures.map(s => s.toJSON()),
      objects: this.objects,
      timer: this.timer,
      configuration: this.configuration
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    const structures = data.structures.map(s => StructureDefinition.fromJSON(s));
    return new LevelDefinition(data.levelNumber, structures, data.objects, data.timer, data.configuration);
  }
}