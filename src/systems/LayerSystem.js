/**
 * LayerSystem - Gestiona el avance de capas cuando la TOP queda vacía.
 * Según Plan de Implementación §7.3
 */
import { LayerRules } from '../rules/LayerRules.js';
import { EventType } from '../core/events/Events.js';

export class LayerSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  checkAndAdvance(levelState) {
    const advancedLayers = [];
    
    for (const structure of levelState.board.structures) {
      for (const shelf of structure.shelves) {
        if (LayerRules.shouldAdvanceLayer(shelf)) {
          const advanced = LayerRules.advanceLayers(shelf);
          for (const layer of advanced) {
            advancedLayers.push({ shelfId: shelf.id, layerId: layer.id, newState: layer.state });
            this.eventBus.emit(EventType.LAYER_ADVANCED, {
              shelfId: shelf.id,
              layerId: layer.id,
              newState: layer.state
            });
          }
        }
      }
    }
    return advancedLayers;
  }
}