/**
 * PowerUp - Define los tipos de power-ups disponibles.
 * 
 * Según Especificación Maestra §24:
 * - Martillo: Elimina un trío completo (3 objetos iguales)
 * - Hielo: Pausa el temporizador 10 segundos
 * - Aumento de tiempo: Añade 60 segundos al temporizador
 * - Varita mágica: Pendiente de definición completa
 * - Recolocador: Pendiente de definición completa
 * 
 * Según Modelo de Datos §96:
 * - Se emite evento POWERUP_USED al usar un power-up
 */
export const PowerUpType = {
  HAMMER: 'HAMMER',           // Martillo - Elimina un trío
  ICE: 'ICE',                 // Hielo - Pausa el tiempo 10 segundos
  TIME_BOOST: 'TIME_BOOST',   // Aumento de tiempo - Añade 60 segundos
  MAGIC_WAND: 'MAGIC_WAND',   // Varita mágica - Pendiente
  SHUFFLER: 'SHUFFLER'        // Recolocador - Pendiente
};

/**
 * Configuración de cada power-up
 */
export const PowerUpConfig = {
  [PowerUpType.HAMMER]: {
    name: 'Martillo',
    icon: '🔨',
    description: 'Elimina un trío completo',
    requiresTarget: true,     // Necesita seleccionar un objeto
    targetType: 'object'
  },
  [PowerUpType.ICE]: {
    name: 'Hielo',
    icon: '❄️',
    description: 'Pausa el tiempo 10 segundos',
    requiresTarget: false,
    duration: 10              // segundos
  },
  [PowerUpType.TIME_BOOST]: {
    name: 'Aumento de tiempo',
    icon: '⏰',
    description: 'Añade 60 segundos',
    requiresTarget: false,
    timeAdded: 60             // segundos
  },
  [PowerUpType.MAGIC_WAND]: {
    name: 'Varita mágica',
    icon: '✨',
    description: 'Convierte objetos (pendiente)',
    requiresTarget: false
  },
  [PowerUpType.SHUFFLER]: {
    name: 'Recolocador',
    icon: '🔄',
    description: 'Reorganiza objetos (pendiente)',
    requiresTarget: false
  }
};

/**
 * Representa una instancia de power-up en el inventario del jugador
 */
export class PowerUp {
  /**
   * @param {PowerUpType} type - Tipo de power-up
   * @param {number} quantity - Cantidad disponible
   */
  constructor(type, quantity = 1) {
    this.type = type;
    this.quantity = quantity;
  }

  /**
   * Verifica si hay power-ups disponibles
   */
  isAvailable() {
    return this.quantity > 0;
  }

  /**
   * Consume un power-up
   * @returns {boolean} true si se consumió correctamente
   */
  consume() {
    if (this.quantity > 0) {
      this.quantity--;
      return true;
    }
    return false;
  }

  /**
   * Añade power-ups al inventario
   */
  add(amount = 1) {
    this.quantity += amount;
  }

  /**
   * Serialización
   */
  toJSON() {
    return {
      type: this.type,
      quantity: this.quantity
    };
  }

  /**
   * Reconstrucción desde JSON
   */
  static fromJSON(data) {
    return new PowerUp(data.type, data.quantity);
  }
}