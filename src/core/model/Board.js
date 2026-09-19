/**
 * Board - Representa el tablero completo del nivel.
 * 
 * Según Modelo de Datos Definitivo §4:
 * - Contiene una colección de estructuras
 * - No mantiene directamente objetos
 * - Los objetos se localizan mediante la jerarquía
 */
export class Board {
  constructor() {
    this.structures = [];
  }

  /**
   * Añade una estructura al tablero
   */
  addStructure(structure) {
    this.structures.push(structure);
  }

  /**
   * Obtiene todas las estructuras visibles
   */
  getVisibleStructures() {
    return this.structures;
  }

  /**
   * Obtiene todos los slots TOP de todas las estructuras
   */
  getAllTopSlots() {
    const topSlots = [];
    for (const structure of this.structures) {
      for (const shelf of structure.shelves) {
        if (shelf.collapsed) continue;
        const topLayer = shelf.getTopLayer();
        if (topLayer) {
          for (const slot of topLayer.slots) {
            topSlots.push({ structure, shelf, layer: topLayer, slot });
          }
        }
      }
    }
    return topSlots;
  }

  toJSON() {
    return {
      structures: this.structures.map(s => s.toJSON())
    };
  }

  static fromJSON(data) {
    const board = new Board();
    board.structures = data.structures.map(s => Structure.fromJSON(s));
    return board;
  }
}