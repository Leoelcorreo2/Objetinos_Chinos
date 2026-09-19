/**
 * Events - Definición de todos los eventos del sistema.
 * Según Modelo de Datos §96-97
 */
export const EventType = {
  // Movimiento
  OBJECT_MOVED: 'OBJECT_MOVED',
  INPUT_LOCKED: 'INPUT_LOCKED',
  INPUT_UNLOCKED: 'INPUT_UNLOCKED',
  
  // Lógica de juego
  TRIO_COMPLETED: 'TRIO_COMPLETED',
  LAYER_ADVANCED: 'LAYER_ADVANCED',
  SHELF_COLLAPSED: 'SHELF_COLLAPSED',
  
  // Estado del juego
  LEVEL_COMPLETED: 'LEVEL_COMPLETED',
  BLOCK_DETECTED: 'BLOCK_DETECTED',
  TIME_EXPIRED: 'TIME_EXPIRED',
  LIFE_LOST: 'LIFE_LOST',
  GAME_OVER: 'GAME_OVER',
  TIMER_TICK: 'TIMER_TICK',
  TIMER_PAUSED: 'TIMER_PAUSED',
  TIMER_RESUMED: 'TIMER_RESUMED',
  
  // Power-ups
  POWERUP_USED: 'POWERUP_USED',
  POWERUP_HAMMER_USED: 'POWERUP_HAMMER_USED',
  POWERUP_ICE_USED: 'POWERUP_ICE_USED',
  POWERUP_TIME_BOOST_USED: 'POWERUP_TIME_BOOST_USED'
};

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  emit(eventType, data = {}) {
    console.log(`📢 EVENTO EMITIDO: ${eventType}`, data);
    if (this.listeners.has(eventType)) {
      for (const callback of this.listeners.get(eventType)) {
        callback({ type: eventType, data });
      }
    }
  }
}