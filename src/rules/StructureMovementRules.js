/**
 * StructureMovementRules - Gestiona el movimiento continuo de estructuras.
 * Según Modelo de Datos §6, §7
 */
export const StructureMovementRules = {
  updatePosition(structure, deltaTimeMs) {
    if (!structure.movement.enabled) return;
    
    const delta = (deltaTimeMs / 1000) * structure.movement.speed;
    if (structure.movement.direction === 'horizontal') {
      structure.position.x += delta;
    } else if (structure.movement.direction === 'vertical') {
      structure.position.y += delta;
    }
  }
};