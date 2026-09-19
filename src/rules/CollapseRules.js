/**
 * CollapseRules - Determina si un estante debe colapsar.
 * Según Modelo de Datos §13: behavior=COLLAPSIBLE y todas las layers vacías
 */
export const CollapseRules = {
  shouldCollapse(shelf) {
    return shelf.canCollapse();
  }
};