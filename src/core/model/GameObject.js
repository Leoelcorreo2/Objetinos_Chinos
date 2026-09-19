/**
 * GameObject - Representa un objeto jugable en el tablero.
 * 
 * Según Modelo de Datos Definitivo §27-28:
 * - La identidad se determina por type + color
 * - No almacena coordenadas (posición lógica = jerarquía)
 * - Puede estar bloqueado o ser especial
 */
export class GameObject {
  /**
   * @param {string} id - Identificador único opaco
   * @param {string} type - Tipo de objeto (APPLE, BOTTLE, etc.)
   * @param {string} color - Color (RED, BLUE, etc.)
   * @param {boolean} blocked - Si está bloqueado (no se puede mover)
   * @param {boolean} special - Si es objeto especial
   * @param {string} specialType - Tipo de especial (NONE, REWARD)
   */
  constructor(id, type, color, blocked = false, special = false, specialType = 'NONE') {
    this.id = id;
    this.type = type;
    this.color = color;
    this.blocked = blocked;
    this.special = special;
    this.specialType = specialType;
  }

  /**
   * Verifica si este objeto forma trío con otro.
   * Identidad = type + color (§28)
   */
  matches(other) {
    return this.type === other.type && this.color === other.color;
  }

  /**
   * Serialización para persistencia futura (§85)
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      color: this.color,
      blocked: this.blocked,
      special: this.special,
      specialType: this.specialType
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    return new GameObject(
      data.id,
      data.type,
      data.color,
      data.blocked,
      data.special,
      data.specialType
    );
  }
}