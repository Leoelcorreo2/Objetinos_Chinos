/**
 * ThemeRegistry - Registro central de todos los temas disponibles
 * 
 * Este archivo importa y registra automáticamente todos los temas
 */
import { themeRegistry } from './ObjectTheme.js';

// Importaciones con nombres exactos que coincidan con los archivos
import { Peluches01 } from './themes/Peluches01.js';
import { Peluches02 } from './themes/Peluches02.js';
import { Azabache01 } from './themes/Azabache01.js';
import { Golosinas01 } from './themes/Golosinas01.js';

// Registrar todos los temas
console.log('📦 Registrando temas...');
themeRegistry.register(Peluches01);
themeRegistry.register(Peluches02);
themeRegistry.register(Azabache01);
themeRegistry.register(Golosinas01);

console.log('✅ Temas registrados:', themeRegistry.listThemes());

export { themeRegistry };