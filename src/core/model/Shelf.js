/**
 * Shelf - Representa un estante dentro de una estructura.
 * 
 * Según Modelo de Datos Definitivo §9-14:
 * - Tipos: NORMAL (3 huecos), SPECIAL (1 hueco)
 * - Comportamiento: STANDARD, COLLAPSIBLE
 * - Una estructura no mezcla tipos NORMAL/SPECIAL (§9)
 * - STANDARD y COLLAPSIBLE sí pueden mezclarse (§12)
 * 
 * §13: COLLAPSIBLE desaparece cuando todas sus capas están vacías
 * §23: NORMAL con última capa TOP vacía NO desaparece
 */
import { LayerState } from './Layer.js';

export const ShelfType = {
  NORMAL: 'normal',
  SPECIAL: 'special'
};

export const ShelfBehavior = {
  STANDARD: 'standard',
  COLLAPSIBLE: 'collapsible'
};

export class Shelf {
  /**
   * @param {string} id - Identificador único opaco
   * @param {ShelfType} type - Tipo de estante
   * @param {ShelfBehavior} behavior - Comportamiento
   */
  constructor(id, type = ShelfType.NORMAL, behavior = ShelfBehavior.STANDARD) {
    this.id = id;
    this.type = type;
    this.behavior = behavior;
    this.layers = [];
    this.collapsed = false;
  }

  /**
   * Añade una capa al estante
   */
  addLayer(layer) {
    this.layers.push(layer);
  }

  /**
   * Capacidad de slots por capa según tipo (§10-11)
   */
  capacity() {
    return this.type === ShelfType.NORMAL ? 3 : 1;
  }

  /**
   * Verifica si todas las capas están completamente vacías
   * (condición para colapso §13)
   */
  isCompletelyEmpty() {
    return this.layers.every(layer => layer.allEmpty());
  }

  /**
   * Obtiene la capa TOP
   */
  getTopLayer() {
    return this.layers.find(layer => layer.state === LayerState.TOP);
  }

  /**
   * Verifica si puede colapsar (§13)
   */
  canCollapse() {
    return this.behavior === ShelfBehavior.COLLAPSIBLE 
      && this.isCompletelyEmpty() 
      && !this.collapsed;
  }

  /**
   * Marca el estante como colapsado
   */
  collapse() {
    this.collapsed = true;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      behavior: this.behavior,
      layers: this.layers.map(l => l.toJSON()),
      collapsed: this.collapsed
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    const shelf = new Shelf(data.id, data.type, data.behavior);
    shelf.layers = data.layers.map(l => Layer.fromJSON(l));
    shelf.collapsed = data.collapsed;
    return shelf;
  }
}