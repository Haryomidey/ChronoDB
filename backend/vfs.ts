export class VirtualFS {
  private files: Record<string, string> = {};

  constructor() {
    this.files['data.log'] = '';
    this.files['snapshots.log'] = '';
  }

  appendFileSync(path: string, data: string) {
    if (!this.files[path]) this.files[path] = '';
    this.files[path] += data;
  }

  readFileSync(path: string): string {
    return this.files[path] || '';
  }

  writeFileSync(path: string, data: string) {
    this.files[path] = data;
  }

  getRaw(path: string) {
    return this.files[path];
  }
}

export const vfs = new VirtualFS();