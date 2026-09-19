/**
 * MovementRules - Determina si un movimiento es válido.
 * Según Plan de Implementación §6.1 y Modelo de Datos §17, §31
 */
import { LayerState } from '../core/model/Layer.js';
import { getObjectLocation, findSlotById } from '../core/queries/StateQueries.js';

export const MovementRules = {
  canMove(levelState, objectId, destinationSlotId) {
    const obj = levelState.dynamicState.get(objectId);
    if (!obj) return { valid: false, reason: 'OBJECT_NOT_FOUND' };
    if (obj.blocked) return { valid: false, reason: 'OBJECT_BLOCKED' };

    const origin = getObjectLocation(levelState.board, levelState.dynamicState, objectId);
    if (!origin) return { valid: false, reason: 'ORIGIN_NOT_FOUND' };
    if (origin.layer.state !== LayerState.TOP) return { valid: false, reason: 'ORIGIN_NOT_TOP' };

    const dest = findSlotById(levelState.board, destinationSlotId);
    if (!dest) return { valid: false, reason: 'DESTINATION_NOT_FOUND' };
    if (dest.layer.state !== LayerState.TOP) return { valid: false, reason: 'DESTINATION_NOT_TOP' };
    if (!dest.slot.isEmpty()) return { valid: false, reason: 'DESTINATION_OCCUPIED' };
    if (dest.shelf.collapsed) return { valid: false, reason: 'DESTINATION_COLLAPSED' };

    return { valid: true, origin, destination: dest };
  }
};