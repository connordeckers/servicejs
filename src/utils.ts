import { promises as fs } from 'fs';
export const exists = (file: string) => new Promise(res => fs.access(file).then(() => res(true)).catch(() => res(false)));