/**
 * LayerRules - Determina el avance de capas.
 * Según Modelo de Datos §20, §23, §24
 */
import { LayerState } from '../core/model/Layer.js';
import { ShelfType } from '../core/model/Shelf.js';

export const LayerRules = {
  shouldAdvanceLayer(shelf) {
    const topLayer = shelf.layers.find(l => l.state === LayerState.TOP);
    if (!topLayer) return false;
    if (!topLayer.allEmpty()) return false;

    // §23: Si es la última capa de un estante NORMAL, NO desaparece.
    const isLastLayer = shelf.layers.indexOf(topLayer) === shelf.layers.length - 1;
    if (isLastLayer && shelf.type === ShelfType.NORMAL) return false;

    // Debe existir al menos una capa posterior para avanzar
    const hasFollowing = shelf.layers.some(l => shelf.layers.indexOf(l) > shelf.layers.indexOf(topLayer));
    return hasFollowing;
  },

  advanceLayers(shelf) {
    const layers = shelf.layers;
    const topIndex = layers.findIndex(l => l.state === LayerState.TOP);
    if (topIndex === -1) return [];

    const advanced = [];
    layers[topIndex].state = LayerState.RETIRED;

    for (let i = topIndex + 1; i < layers.length; i++) {
      const layer = layers[i];
      if (layer.state === LayerState.SHADED) {
        layer.state = LayerState.TOP;
      } else if (layer.state === LayerState.INVISIBLE) {
        layer.state = LayerState.SHADED;
      }
      advanced.push(layer);
    }
    return advanced;
  }
};