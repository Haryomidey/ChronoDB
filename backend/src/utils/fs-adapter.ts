
import * as fs from 'fs';
import * as path from 'path';

// Improved Node detection for various environments
const isNode = typeof process !== 'undefined' && 
               (process as any).versions && 
               !!(process as any).versions.node && 
               typeof fs.readFileSync === 'function';

export const fsAdapter = {
  appendFileSync: (filePath: string, data: string) => {
    if (isNode) {
      try {
        const dir = path.dirname(filePath);
        if (fs.mkdirSync && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.appendFileSync(filePath, data);
      } catch (e) {
        console.error('FS Write Error:', e);
      }
    } else {
      const existing = localStorage.getItem(filePath) || '';
      localStorage.setItem(filePath, existing + data);
    }
  },
  readFileSync: (filePath: string): string => {
    if (isNode) {
      try {
        if (!fs.existsSync(filePath)) return '';
        return fs.readFileSync(filePath, 'utf8');
      } catch (e) {
        return '';
      }
    } else {
      return localStorage.getItem(filePath) || '';
    }
  },
  writeFileSync: (filePath: string, data: string) => {
    if (isNode) {
      try {
        const dir = path.dirname(filePath);
        if (fs.mkdirSync && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, data);
      } catch (e) {
        console.error('FS Write Error:', e);
      }
    } else {
      localStorage.setItem(filePath, data);
    }
  },
  existsSync: (filePath: string): boolean => {
    if (isNode) {
      try {
        return fs.existsSync(filePath);
      } catch (e) {
        return false;
      }
    }
    return localStorage.getItem(filePath) !== null;
  }
};
