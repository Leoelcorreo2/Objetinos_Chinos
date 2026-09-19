/**
 * Slot - Representa un hueco donde puede existir un objeto.
 * 
 * Según Modelo de Datos Definitivo §25-26:
 * - No depende de coordenadas de pantalla
 * - Contiene objectId (null si vacío)
 * - La posición visual se calcula desde la jerarquía
 */
export class Slot {
  /**
   * @param {string} id - Identificador único opaco
   * @param {number} index - Posición dentro de la capa (0, 1, 2)
   */
  constructor(id, index) {
    this.id = id;
    this.index = index;
    this.objectId = null;
  }

  /**
   * Verifica si el slot está vacío
   */
  isEmpty() {
    return this.objectId === null;
  }

  /**
   * Asigna un objeto al slot
   */
  setObject(objectId) {
    this.objectId = objectId;
  }

  /**
   * Limpia el slot
   */
  clear() {
    this.objectId = null;
  }

  toJSON() {
    return {
      id: this.id,
      index: this.index,
      objectId: this.objectId
    };
  }

  static fromJSON(data) {
    const slot = new Slot(data.id, data.index);
    slot.objectId = data.objectId;
    return slot;
  }
}