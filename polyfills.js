import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

// Polyfill cho Buffer
polyfillGlobal('Buffer', () => require('buffer').Buffer);

// Polyfill cho process
if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
  global.process = require('process');
} else {
  const bProcess = require('process');
  for (var p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

process.browser = false;
if (typeof Buffer === 'undefined') global.Buffer = require('buffer').Buffer;