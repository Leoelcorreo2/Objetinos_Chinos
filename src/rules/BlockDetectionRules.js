/**
 * BlockDetectionRules - Determina si la partida está bloqueada.
 * Según Modelo de Datos §67, §80: quedan objetos pero no hay movimientos válidos
 */
import { MovementRules } from './MovementRules.js';
import { getEmptyTopSlots, getTopObjects } from '../core/queries/StateQueries.js';

export const BlockDetectionRules = {
  isBlocked(levelState) {
    const remaining = levelState.getRemainingObjects();
    if (remaining === 0) return false;

    const emptySlots = getEmptyTopSlots(levelState.board);
    if (emptySlots.length === 0) return true;

    const topObjects = getTopObjects(levelState.board, levelState.dynamicState);
    
    for (const movable of topObjects) {
      for (const empty of emptySlots) {
        if (movable.slot.id === empty.slot.id) continue;
        
        const check = MovementRules.canMove(levelState, movable.obj.id, empty.slot.id);
        if (check.valid) return false; // Existe al menos un movimiento válido
      }
    }
    
    return true; // No se encontró ningún movimiento válido
  }
};