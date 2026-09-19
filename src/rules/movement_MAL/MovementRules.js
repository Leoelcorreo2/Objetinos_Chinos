/**
 * MovementRules - Reglas puras para validar movimientos de objetos.
 * 
 * Según Modelo de Datos §6.1, §17, §25:
 * - El objeto debe existir y no estar bloqueado.
 * - El origen debe ser una capa TOP.
 * - El destino debe ser una capa TOP y estar vacío.
 */
import { LayerState } from '../../core/model/Layer.js';

export const MovementRules = {
  /**
   * Comprueba si un movimiento es válido.
   * @param {LevelState} levelState 
   * @param {string} objectId 
   * @param {string} destinationSlotId 
   * @returns {Object} { valid: boolean, reason?: string }
   */
  canMove(levelState, objectId, destinationSlotId) {
    // 1. Verificar que el objeto existe
    const obj = levelState.dynamicState.get(objectId);
    if (!obj) {
      return { valid: false, reason: 'OBJECT_NOT_FOUND' };
    }

    // 2. Verificar que el objeto no está bloqueado
    if (obj.blocked) {
      return { valid: false, reason: 'OBJECT_IS_BLOCKED' };
    }

    // 3. Encontrar el slot de origen y verificar que es TOP
    const sourceSlot = this._findSlotByObject(levelState, objectId);
    if (!sourceSlot) {
      return { valid: false, reason: 'SOURCE_SLOT_NOT_FOUND' };
    }

    const sourceLayer = this._findLayerOfSlot(levelState, sourceSlot);
    if (!sourceLayer || sourceLayer.state !== LayerState.TOP) {
      return { valid: false, reason: 'SOURCE_NOT_TOP_LAYER' };
    }

    // 4. Encontrar el slot de destino
    const destSlot = this._findSlotById(levelState, destinationSlotId);
    if (!destSlot) {
      return { valid: false, reason: 'DESTINATION_SLOT_NOT_FOUND' };
    }

    // 5. Verificar que el destino es TOP
    const destLayer = this._findLayerOfSlot(levelState, destSlot);
    if (!destLayer || destLayer.state !== LayerState.TOP) {
      return { valid: false, reason: 'DESTINATION_NOT_TOP_LAYER' };
    }

    // 6. Verificar que el destino está vacío
    if (destSlot.objectId !== null) {
      return { valid: false, reason: 'DESTINATION_OCCUPIED' };
    }

    // 7. Verificar que no es el mismo slot
    if (sourceSlot.id === destSlot.id) {
      return { valid: false, reason: 'SAME_SLOT' };
    }

    return { valid: true };
  },

  _findSlotByObject(levelState, objectId) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            if (slot.objectId === objectId) {
              return slot;
            }
          }
        }
      }
    }
    return null;
  },

  _findSlotById(levelState, slotId) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            if (slot.id === slotId) {
              return slot;
            }
          }
        }
      }
    }
    return null;
  },

  _findLayerOfSlot(levelState, targetSlot) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          if (layer.slots.includes(targetSlot)) {
            return layer;
          }
        }
      }
    }
    return null;
  }
};