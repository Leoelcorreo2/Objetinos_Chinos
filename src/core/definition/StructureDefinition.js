/**
 * StructureDefinition - Define la estructura de una Estantería o Balda.
 * 
 * Según Modelo de Datos §47-49:
 * - StructureDefinition es la plantilla inmutable
 * - StructureState es la instancia viva mutable
 */
import { Orientation } from '../model/Structure.js';
import { ShelfDefinition } from './ShelfDefinition.js';

export class StructureDefinition {
  /**
   * @param {string} id - Identificador único
   * @param {Orientation} orientation - Orientación (HORIZONTAL, VERTICAL)
   * @param {Array<ShelfDefinition>} shelves - Estantes de la estructura
   * @param {Object} movement - Configuración de movimiento {enabled, direction, speed}
   */
  constructor(id, orientation = Orientation.VERTICAL, shelves = [], movement = { enabled: false, direction: null, speed: 0 }) {
    this.id = id;
    this.orientation = orientation;
    this.shelves = shelves;
    this.movement = movement;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this.id,
      orientation: this.orientation,
      shelves: this.shelves.map(s => s.toJSON()),
      movement: this.movement
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    const shelves = data.shelves.map(s => ShelfDefinition.fromJSON(s));
    return new StructureDefinition(data.id, data.orientation, shelves, data.movement);
  }
}