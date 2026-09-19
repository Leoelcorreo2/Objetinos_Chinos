/**
 * ShelfDefinition - Define la estructura de un estante.
 * 
 * Según Modelo de Datos §47-49:
 * - ShelfDefinition es la plantilla inmutable
 * - ShelfState es la instancia viva mutable
 */
import { ShelfType, ShelfBehavior } from '../model/Shelf.js';
import { LayerDefinition } from './LayerDefinition.js';

export class ShelfDefinition {
  /**
   * @param {string} id - Identificador único
   * @param {ShelfType} type - Tipo de estante (NORMAL, SPECIAL)
   * @param {ShelfBehavior} behavior - Comportamiento (STANDARD, COLLAPSIBLE)
   * @param {Array<LayerDefinition>} layers - Capas del estante
   */
  constructor(id, type = ShelfType.NORMAL, behavior = ShelfBehavior.STANDARD, layers = []) {
    this.id = id;
    this.type = type;
    this.behavior = behavior;
    this.layers = layers;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      behavior: this.behavior,
      layers: this.layers.map(l => l.toJSON())
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    const layers = data.layers.map(l => LayerDefinition.fromJSON(l));
    return new ShelfDefinition(data.id, data.type, data.behavior, layers);
  }
}