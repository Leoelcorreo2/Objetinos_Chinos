/**
 * StateQueries - Funciones de consulta sobre el estado.
 * 
 * Según Plan de Implementación §5.6:
 * - Las consultas no modifican el estado
 * - Permiten localizar entidades por ID
 */
import { LayerState } from '../model/Layer.js';

/**
 * Busca un objeto por ID en el estado dinámico
 */
export function findObjectById(dynamicState, objectId) {
  return dynamicState.get(objectId);
}

/**
 * Obtiene la ubicación completa de un objeto
 * Returns: { structure, shelf, layer, slot } o null
 */
export function getObjectLocation(board, dynamicState, objectId) {
  if (!dynamicState.has(objectId)) return null;

  for (const structure of board.structures) {
    for (const shelf of structure.shelves) {
      if (shelf.collapsed) continue;
      for (const layer of shelf.layers) {
        for (const slot of layer.slots) {
          if (slot.objectId === objectId) {
            return { structure, shelf, layer, slot };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Busca un slot por ID
 */
export function findSlotById(board, slotId) {
  for (const structure of board.structures) {
    for (const shelf of structure.shelves) {
      if (shelf.collapsed) continue;
      for (const layer of shelf.layers) {
        for (const slot of layer.slots) {
          if (slot.id === slotId) {
            return { structure, shelf, layer, slot };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Obtiene todos los slots TOP vacíos
 */
export function getEmptyTopSlots(board) {
  const emptySlots = [];
  for (const structure of board.structures) {
    for (const shelf of structure.shelves) {
      if (shelf.collapsed) continue;
      const topLayer = shelf.getTopLayer();
      if (topLayer && topLayer.state === LayerState.TOP) {
        for (const slot of topLayer.slots) {
          if (slot.isEmpty()) {
            emptySlots.push({ structure, shelf, layer: topLayer, slot });
          }
        }
      }
    }
  }
  return emptySlots;
}

/**
 * Obtiene todos los objetos en capas TOP
 */
export function getTopObjects(board, dynamicState) {
  const topObjects = [];
  for (const structure of board.structures) {
    for (const shelf of structure.shelves) {
      if (shelf.collapsed) continue;
      const topLayer = shelf.getTopLayer();
      if (topLayer && topLayer.state === LayerState.TOP) {
        for (const slot of topLayer.slots) {
          if (!slot.isEmpty()) {
            const obj = dynamicState.get(slot.objectId);
            if (obj) {
              topObjects.push({ obj, structure, shelf, layer: topLayer, slot });
            }
          }
        }
      }
    }
  }
  return topObjects;
}

/**
 * Cuenta los objetos restantes
 */
export function countRemainingObjects(dynamicState) {
  return dynamicState.count();
}

/**
 * Verifica si un objeto está en capa TOP
 */
export function isObjectInTopLayer(board, dynamicState, objectId) {
  const location = getObjectLocation(board, dynamicState, objectId);
  if (!location) return false;
  return location.layer.state === LayerState.TOP;
}

/**
 * Obtiene todos los estantes colapsables que están completamente vacíos
 */
export function getCollapsibleEmptyShelves(board) {
  const collapsible = [];
  for (const structure of board.structures) {
    for (const shelf of structure.shelves) {
      if (shelf.canCollapse()) {
        collapsible.push({ structure, shelf });
      }
    }
  }
  return collapsible;
}