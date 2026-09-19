/**
 * TrioSystem - Detecta y elimina tríos completados.
 * Según Plan de Implementación §7.2
 */
import { TrioRules } from '../rules/TrioRules.js';
import { EventType } from '../core/events/Events.js';

export class TrioSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(levelState, shelfId, layerId) {
    const shelf = this._findShelf(levelState.board, shelfId);
    if (!shelf) return null;
    
    const layer = shelf.layers.find(l => l.id === layerId);
    if (!layer) return null;

    const trio = TrioRules.detectTrio(shelf, layer, levelState.dynamicState);
    if (!trio) return null;

    // Eliminar los 3 objetos del estado dinámico y de los slots
    for (const obj of trio) {
      levelState.dynamicState.remove(obj.id);
      const slot = layer.slots.find(s => s.objectId === obj.id);
      if (slot) slot.clear();
    }

    this.eventBus.emit(EventType.TRIO_COMPLETED, {
      shelfId,
      layerId,
      objectType: trio[0].type,
      objectColor: trio[0].color,
      objectIds: trio.map(o => o.id)
    });

    return trio;
  }

  _findShelf(board, shelfId) {
    for (const structure of board.structures) {
      const shelf = structure.shelves.find(sh => sh.id === shelfId);
      if (shelf) return shelf;
    }
    return null;
  }
}