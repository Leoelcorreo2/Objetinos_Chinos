/**
 * CollapseSystem - Gestiona el colapso de estantes vacíos.
 * Según Plan de Implementación §7.4
 */
import { CollapseRules } from '../rules/CollapseRules.js';
import { EventType } from '../core/events/Events.js';

export class CollapseSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  check(levelState) {
    const collapsedShelves = [];
    
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (CollapseRules.shouldCollapse(shelf)) {
          shelf.collapse(); // Marca como colapsado
          collapsedShelves.push(shelf.id);
          this.eventBus.emit(EventType.SHELF_COLLAPSED, { shelfId: shelf.id });
        }
      }
    }
    return collapsedShelves;
  }
}