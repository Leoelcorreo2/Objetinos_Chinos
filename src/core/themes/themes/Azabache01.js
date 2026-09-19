/**
 * Tema: Azabache 01
 * Objetos: Gemas, cristales, minerales
 * Colores consistentes: RED, BLUE, GREEN
 */
import { ObjectTheme } from '../ObjectTheme.js';

export const Azabache01 = new ObjectTheme(
  'azabache_01',
  'Azabache 01',
  [
    // Rubí
    { type: 'RUBY', color: 'RED', glyph: '🔴' },
    { type: 'RUBY', color: 'BLUE', glyph: '🧿' },
    { type: 'RUBY', color: 'GREEN', glyph: '🟢' },
    
    // Zafiro
    { type: 'SAPPHIRE', color: 'RED', glyph: '🍒' },
    { type: 'SAPPHIRE', color: 'BLUE', glyph: '🔷' },
    { type: 'SAPPHIRE', color: 'GREEN', glyph: '🍀' },
    
    // Esmeralda
    { type: 'EMERALD', color: 'RED', glyph: '💗' },
    { type: 'EMERALD', color: 'BLUE', glyph: '💠' },
    { type: 'EMERALD', color: 'GREEN', glyph: '💚' },
    
    // Amatista
    { type: 'AMETHYST', color: 'RED', glyph: '🌹' },
    { type: 'AMETHYST', color: 'BLUE', glyph: '🦋' },
    { type: 'AMETHYST', color: 'GREEN', glyph: '🍃' },
    
    // Topacio
    { type: 'TOPAZ', color: 'RED', glyph: '🎈' },
    { type: 'TOPAZ', color: 'BLUE', glyph: '💎' },
    { type: 'TOPAZ', color: 'GREEN', glyph: '🍏' }
  ],
  {
    category: 'azabache',
    difficulty: 2,
    description: 'Gemas y cristales preciosos'
  }
);