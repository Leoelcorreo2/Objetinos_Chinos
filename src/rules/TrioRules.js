/**
 * TrioRules - Determina si existe un trío válido en una capa.
 * Según Modelo de Datos §37: 3 objetos, mismo type+color, mismo Shelf, misma Layer, Layer=TOP
 */
import { LayerState } from '../core/model/Layer.js';

export const TrioRules = {
  detectTrio(shelf, layer, dynamicState) {
    if (layer.state !== LayerState.TOP) return null;

    const objects = layer.slots
      .map(slot => slot.objectId ? dynamicState.get(slot.objectId) : null)
      .filter(obj => obj !== null);

    if (objects.length !== 3) return null;

    const [a, b, c] = objects;
    if (a.matches(b) && b.matches(c)) {
      return [a, b, c];
    }
    return null;
  }
};