/**
 * MovementSystem - Ejecuta el movimiento de objetos entre huecos.
 * 
 * Según Modelo de Datos §94-99:
 * - Coordina con MovementRules para validar.
 * - Actualiza el LevelState (DynamicState y jerarquía Board).
 * - Emite eventos para que otros sistemas reaccionen (y el renderer actualice).
 */
import { MovementRules } from '../../rules/movement/MovementRules.js';
import { EventType } from '../../core/events/Events.js';

export class MovementSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  /**
   * Ejecuta un movimiento de objeto.
   * @param {LevelState} levelState - Estado actual del nivel
   * @param {string} objectId - ID del objeto a mover
   * @param {string} destinationSlotId - ID del hueco destino
   * @returns {Object} Resultado del movimiento { success, reason, destination }
   */
  execute(levelState, objectId, destinationSlotId) {
    console.log('⚙️ MovementSystem.execute:', objectId, '->', destinationSlotId);

    // 1. Validar el movimiento
    const validation = MovementRules.canMove(levelState, objectId, destinationSlotId);
    if (!validation.valid) {
      console.warn('⚠️ MovementSystem: Movimiento inválido:', validation.reason);
      return { success: false, reason: validation.reason };
    }

    // 2. Obtener referencias
    const obj = levelState.dynamicState.get(objectId);
    const destSlot = this._findSlotById(levelState, destinationSlotId);
    
    if (!obj || !destSlot) {
      console.error('❌ MovementSystem: Objeto o destino no encontrado');
      return { success: false, reason: 'NOT_FOUND' };
    }

    // 3. Encontrar el slot de origen para liberarlo
    const sourceSlot = this._findSlotByObject(levelState, objectId);
    if (sourceSlot) {
      sourceSlot.objectId = null;
    }

    // 4. Asignar al nuevo slot
    destSlot.objectId = objectId;

    console.log('✅ MovementSystem: Movimiento ejecutado correctamente en el estado lógico');

    // 5. Emitir evento CRÍTICO para que main.js llame a refreshView()
    this.eventBus.emit(EventType.OBJECT_MOVED, {
      objectId: objectId,
      sourceSlotId: sourceSlot ? sourceSlot.id : null,
      destinationSlotId: destinationSlotId
    });

    // 6. Devolver información del destino para que GameController pueda comprobar tríos
    const destLayer = this._findLayerOfSlot(levelState, destSlot);
    const destShelf = this._findShelfOfLayer(levelState, destLayer);

    return { 
      success: true, 
      destination: {
        shelf: destShelf,
        layer: destLayer
      }
    };
  }

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
  }

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
  }

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

  _findShelfOfLayer(levelState, targetLayer) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (shelf.layers.includes(targetLayer)) {
          return shelf;
        }
      }
    }
    return null;
  }
}