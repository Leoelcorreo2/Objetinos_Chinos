/**
 * DynamicState - Gestiona los objetos vivos del nivel.
 * 
 * Según Modelo de Datos Definitivo §5.3:
 * - Mapa de objetos accesibles por ID
 * - Separado del estado estructural
 */
export class DynamicState {
  constructor() {
    this.objects = new Map();
  }

  /**
   * Añade un objeto al estado dinámico
   */
  add(gameObject) {
    this.objects.set(gameObject.id, gameObject);
  }

  /**
   * Obtiene un objeto por ID
   */
  get(id) {
    return this.objects.get(id) || null;
  }

  /**
   * Elimina un objeto del estado dinámico
   */
  remove(id) {
    this.objects.delete(id);
  }

  /**
   * Cuenta los objetos restantes
   */
  count() {
    return this.objects.size;
  }

  /**
   * Obtiene todos los objetos
   */
  getAll() {
    return Array.from(this.objects.values());
  }

  /**
   * Verifica si existe un objeto
   */
  has(id) {
    return this.objects.has(id);
  }

  /**
   * Limpia todos los objetos
   */
  clear() {
    this.objects.clear();
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      objects: Array.from(this.objects.entries()).map(([id, obj]) => ({
        id,
        data: obj.toJSON()
      }))
    };
  }

  /**
   * Reconstrucción
   */
  static fromJSON(data) {
    const state = new DynamicState();
    for (const { id, data: objData } of data.objects) {
      state.add(GameObject.fromJSON(objData));
    }
    return state;
  }
}