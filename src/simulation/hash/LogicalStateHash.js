/**
 * LogicalStateHash - Identifica estados lógicos repetidos.
 * 
 * Según Plan de Implementación §14.2:
 * - Permite identificar estados lógicos repetidos durante búsquedas
 * - El hash NO debe depender de coordenadas de pantalla
 * - El hash NO debe depender de posiciones físicas temporales
 * 
 * Según Modelo de Datos §68-69:
 * - Separación LogicalState vs PhysicalState
 * - Dos estados pueden ser lógicamente equivalentes aunque
 *   una estructura móvil esté en posiciones físicas diferentes
 */
export class LogicalStateHash {
  /**
   * Genera un hash determinista del estado lógico
   * @param {SimulationState} simState
   * @returns {string} Hash del estado
   */
  static compute(simState) {
    const snapshot = simState.toLogicalSnapshot();
    
    // Ordenar las claves para garantizar determinismo
    const sortedObjectKeys = Object.keys(snapshot.objects).sort();
    const sortedSlotKeys = Object.keys(snapshot.slots).sort();
    
    // Construir representación canónica
    const parts = [];
    
    // 1. Objetos presentes (ordenados por ID)
    for (const key of sortedObjectKeys) {
      const obj = snapshot.objects[key];
      parts.push(`${key}:${obj.type}:${obj.color}`);
    }
    
    // 2. Ocupación de slots (ordenados por ID)
    for (const key of sortedSlotKeys) {
      const objectId = snapshot.slots[key];
      parts.push(`${key}=${objectId || '_'}`);
    }
    
    // 3. Unir y hash simple
    const canonical = parts.join('|');
    return LogicalStateHash._simpleHash(canonical);
  }

  /**
   * Hash simple determinista (no criptográfico, solo para identificación)
   */
  static _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString(36);
  }
}