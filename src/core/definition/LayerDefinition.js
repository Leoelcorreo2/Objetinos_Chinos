/**
 * LayerDefinition - Define la estructura de una capa.
 * 
 * Según Modelo de Datos §47-49:
 * - LevelDefinition describe cómo debe ser un nivel
 * - LevelState describe cómo está ese nivel en un momento concreto
 * 
 * LayerDefinition es INMUTABLE (plantilla)
 * LayerState es MUTABLE (instancia viva)
 */
import { LayerState } from '../model/Layer.js';

export class LayerDefinition {
  /**
   * @param {string} id - Identificador único
   * @param {LayerState} state - Estado inicial (TOP, SHADED, INVISIBLE)
   * @param {Array<{slotIndex: number, objectId: string|null}>} slots - Definición de slots
   */
  constructor(id, state = LayerState.TOP, slots = []) {
    this.id = id;
    this.state = state;
    this.slots = slots; // [{slotIndex: 0, objectId: 'obj_1'}, ...]
  }

  /**
   * Serialización para persistencia futura (§85)
   */
  toJSON() {
    return {
      id: this.id,
      state: this.state,
      slots: this.slots
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    return new LayerDefinition(data.id, data.state, data.slots);
  }
}