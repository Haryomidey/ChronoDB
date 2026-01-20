export function calculateChecksum(data: any): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  return hash.toString(16);
}

export function generateId(prefix: string = 'doc'): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}