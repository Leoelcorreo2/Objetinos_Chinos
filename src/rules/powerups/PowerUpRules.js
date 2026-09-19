/**
 * PowerUpRules - Valida el uso de power-ups.
 * 
 * Martillo:
 * - El objeto SELECCIONADO debe estar en TOP, no bloqueado y no ser especial
 * - Los objetos ELIMINADOS pueden estar en cualquier capa, estante o estantería
 * - Se eliminan TODOS los objetos con la misma identidad (type+color)
 * - NO se requiere que existan 3 objetos iguales (el Martillo elimina todos los que encuentre)
 */
import { PowerUpType } from '../../core/model/PowerUp.js';
import { getObjectLocation } from '../../core/queries/StateQueries.js';
import { LayerState } from '../../core/model/Layer.js';

export const PowerUpRules = {
  canUsePowerUp(levelState, powerUpType, targetObjectId, inventory) {
    // 1. Verificar que el power-up está disponible
    if (!inventory[powerUpType] || inventory[powerUpType] <= 0) {
      return { valid: false, reason: 'POWERUP_NOT_AVAILABLE' };
    }

    // 2. Validar según el tipo de power-up
    switch (powerUpType) {
      case PowerUpType.HAMMER:
        return this._validateHammer(levelState, targetObjectId);
      
      case PowerUpType.ICE:
      case PowerUpType.TIME_BOOST:
        return { valid: true };
      
      case PowerUpType.MAGIC_WAND:
      case PowerUpType.SHUFFLER:
        return { valid: false, reason: 'POWERUP_NOT_IMPLEMENTED' };
      
      default:
        return { valid: false, reason: 'UNKNOWN_POWERUP' };
    }
  },

  /**
   * Valida el uso del Martillo
   * El objeto SELECCIONADO debe:
   * - Existir en DynamicState
   * - Estar en capa TOP
   * - No estar bloqueado
   * - No ser objeto especial
   * 
   * NO se requiere que existan 3 objetos iguales.
   * El Martillo eliminará todos los que encuentre (1, 2, 3, 4...).
   */
  _validateHammer(levelState, targetObjectId) {
    if (!targetObjectId) {
      return { valid: false, reason: 'MISSING_TARGET' };
    }

    // Verificar que el objeto existe
    const obj = levelState.dynamicState.get(targetObjectId);
    if (!obj) {
      return { valid: false, reason: 'OBJECT_NOT_FOUND' };
    }

    // Verificar que no es un objeto especial
    if (obj.special) {
      return { valid: false, reason: 'CANNOT_TARGET_SPECIAL_OBJECT' };
    }

    // Verificar que no está bloqueado
    if (obj.blocked) {
      return { valid: false, reason: 'CANNOT_TARGET_BLOCKED_OBJECT' };
    }

    // Verificar que está en capa TOP
    const location = getObjectLocation(levelState.board, levelState.dynamicState, targetObjectId);
    if (!location) {
      return { valid: false, reason: 'OBJECT_LOCATION_NOT_FOUND' };
    }

    if (location.layer.state !== LayerState.TOP) {
      return { valid: false, reason: 'OBJECT_NOT_IN_TOP_LAYER' };
    }

    return { valid: true };
  }
};