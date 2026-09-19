// 6. BlockDetectionRules
console.log('6. Probando BlockDetectionRules...');
const state6 = createTestLevelState();
console.log('   isBlocked (hay huecos libres):', !BlockDetectionRules.isBlocked(state6)); // true (no está bloqueado)

// Crear un estado verdaderamente bloqueado: TODOS los slots TOP llenos
const stateBlocked = createTestLevelState();
const shelf1_b = stateBlocked.board.structures[0].shelves[0];
const shelf2_b = stateBlocked.board.structures[0].shelves[1];

// Llenar shelf1
shelf1_b.layers[0].slots[0].setObject('o4'); stateBlocked.dynamicState.add(new GameObject('o4', 'BOOK', 'GREEN'));
shelf1_b.layers[0].slots[1].setObject('o5'); stateBlocked.dynamicState.add(new GameObject('o5', 'BOOK', 'GREEN'));
shelf1_b.layers[0].slots[2].setObject('o6'); stateBlocked.dynamicState.add(new GameObject('o6', 'BOOK', 'GREEN'));

// Llenar shelf2
shelf2_b.layers[0].slots[0].setObject('o7'); stateBlocked.dynamicState.add(new GameObject('o7', 'BALL', 'BLUE'));
shelf2_b.layers[0].slots[1].setObject('o8'); stateBlocked.dynamicState.add(new GameObject('o8', 'BALL', 'BLUE'));
shelf2_b.layers[0].slots[2].setObject('o9'); stateBlocked.dynamicState.add(new GameObject('o9', 'BALL', 'BLUE'));

console.log('   isBlocked (sin huecos libres, objetos restantes):', BlockDetectionRules.isBlocked(stateBlocked)); // true
console.log('   ✓ BlockDetectionRules OK\n');