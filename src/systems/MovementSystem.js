/**
 * MovementSystem - Ejecuta el movimiento de objetos entre huecos.
 */
import { MovementRules } from '../rules/movement/MovementRules.js';
import { EventType } from '../core/events/Events.js';

export class MovementSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  execute(levelState, objectId, destinationSlotId) {
    console.log('⚙️ [MovementSystem] execute:', objectId, '->', destinationSlotId);

    const validation = MovementRules.canMove(levelState, objectId, destinationSlotId);
    console.log('📝 [MovementSystem] Validación:', validation);
    
    if (!validation.valid) {
      return { success: false, reason: validation.reason };
    }

    const obj = levelState.dynamicState.get(objectId);
    const destSlot = this._findSlotById(levelState, destinationSlotId);
    const sourceSlot = this._findSlotByObject(levelState, objectId);
    
    if (!obj || !destSlot || !sourceSlot) {
      console.error('❌ [MovementSystem] Objeto o slots no encontrados');
      return { success: false, reason: 'NOT_FOUND' };
    }

    // Ejecutar movimiento lógico
    sourceSlot.objectId = null;
    destSlot.objectId = objectId;
    console.log('✅ [MovementSystem] Estado lógico actualizado');

    // EMITIR EL EVENTO CRÍTICO
    console.log('📢 [MovementSystem] Emitiendo evento OBJECT_MOVED');
    this.eventBus.emit(EventType.OBJECT_MOVED, {
      objectId: objectId,
      sourceSlotId: sourceSlot.id,
      destinationSlotId: destinationSlotId
    });

    const destLayer = this._findLayerOfSlot(levelState, destSlot);
    const destShelf = this._findShelfOfLayer(levelState, destLayer);

    return { 
      success: true, 
      destination: { shelf: destShelf, layer: destLayer }
    };
  }

  _findSlotByObject(levelState, objectId) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        for (const layer of shelf.layers) {
          for (const slot of layer.slots) {
            if (slot.objectId === objectId) return slot;
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
            if (slot.id === slotId) return slot;
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
          if (layer.slots.includes(targetSlot)) return layer;
        }
      }
    }
    return null;
  }

  _findShelfOfLayer(levelState, targetLayer) {
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (shelf.layers.includes(targetLayer)) return shelf;
      }
    }
    return null;
  }
}