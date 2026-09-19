/**
 * Structure - Representa una Estantería o Balda.
 * 
 * Según Modelo de Datos Definitivo §5-8:
 * - Orientación: HORIZONTAL, VERTICAL
 * - Puede ser fija o móvil
 * - Position: {x, y, z} para posición física
 * - Movement: {enabled, direction, speed}
 */
export const Orientation = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

export class Structure {
  /**
   * @param {string} id - Identificador único opaco
   * @param {Orientation} orientation - Orientación de la estructura
   */
  constructor(id, orientation = Orientation.VERTICAL) {
    this.id = id;
    this.orientation = orientation;
    this.position = { x: 0, y: 0, z: 0 };
    this.movement = { enabled: false, direction: null, speed: 0 };
    this.shelves = [];
  }

  /**
   * Añade un estante a la estructura
   */
  addShelf(shelf) {
    this.shelves.push(shelf);
  }

  /**
   * Obtiene estantes no colapsados
   */
  getVisibleShelves() {
    return this.shelves.filter(shelf => !shelf.collapsed);
  }

  /**
   * Actualiza posición física (para estructuras móviles)
   */
  updatePosition(x, y, z) {
    this.position = { x, y, z };
  }

  toJSON() {
    return {
      id: this.id,
      orientation: this.orientation,
      position: this.position,
      movement: this.movement,
      shelves: this.shelves.map(s => s.toJSON())
    };
  }

  static fromJSON(data) {
    const structure = new Structure(data.id, data.orientation);
    structure.position = data.position;
    structure.movement = data.movement;
    structure.shelves = data.shelves.map(s => Shelf.fromJSON(s));
    return structure;
  }
}