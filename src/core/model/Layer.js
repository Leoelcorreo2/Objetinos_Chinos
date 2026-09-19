/**
 * Layer - Representa una capa de un estante.
 * 
 * Según Modelo de Datos Definitivo §15-22:
 * - Estados: TOP, SHADED, INVISIBLE
 * - TOP es la única capa interactiva (§17)
 * - SHADED es visible pero no interactiva (§18)
 * - INVISIBLE no se muestra (§19)
 * - No existe límite fijo de dos capas (§15)
 */
export const LayerState = {
  TOP: 'top',
  SHADED: 'shaded',
  INVISIBLE: 'invisible',
  RETIRED: 'retired' // Estado interno cuando desaparece
};

export class Layer {
  /**
   * @param {string} id - Identificador único opaco
   * @param {LayerState} state - Estado inicial de la capa
   */
  constructor(id, state = LayerState.TOP) {
    this.id = id;
    this.state = state;
    this.slots = [];
  }

  /**
   * Añade un slot a la capa
   */
  addSlot(slot) {
    this.slots.push(slot);
  }

  /**
   * Verifica si todos los slots están vacíos
   */
  allEmpty() {
    return this.slots.every(slot => slot.isEmpty());
  }

  /**
   * Obtiene los IDs de objetos en esta capa
   */
  getObjectIds() {
    return this.slots
      .filter(slot => !slot.isEmpty())
      .map(slot => slot.objectId);
  }

  /**
   * Verifica si la capa es interactiva
   */
  isInteractive() {
    return this.state === LayerState.TOP;
  }

  /**
   * Verifica si la capa es visible
   */
  isVisible() {
    return this.state === LayerState.TOP || this.state === LayerState.SHADED;
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
      slots: this.slots.map(s => s.toJSON())
    };
  }

  static fromJSON(data) {
    const layer = new Layer(data.id, data.state);
    layer.slots = data.slots.map(s => Slot.fromJSON(s));
    return layer;
  }
}