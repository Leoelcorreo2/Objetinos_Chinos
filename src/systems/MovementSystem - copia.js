/**
 * MovementSystem - Ejecuta el movimiento de un objeto.
 * Según Plan de Implementación §7.1
 */
import { MovementRules } from '../rules/MovementRules.js';
import { EventType } from '../core/events/Events.js';

export class MovementSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  execute(levelState, objectId, destinationSlotId) {
    const check = MovementRules.canMove(levelState, objectId, destinationSlotId);
    if (!check.valid) {
      return { success: false, reason: check.reason };
    }

    const { origin, destination } = check;
    
    // Ejecutar movimiento lógico
    origin.slot.clear();
    destination.slot.setObject(objectId);

    this.eventBus.emit(EventType.OBJECT_MOVED, {
      objectId,
      sourceSlotId: origin.slot.id,
      destinationSlotId: destination.slot.id,
      destinationShelfId: destination.shelf.id,
      destinationLayerId: destination.layer.id
    });

    return { success: true, origin, destination };
  }
}