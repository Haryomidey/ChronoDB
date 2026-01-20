
export class VersionManager {
  private currentVersion: number = 0;

  constructor(initialVersion: number = 0) {
    this.currentVersion = initialVersion;
  }

  getNext(): number {
    return ++this.currentVersion;
  }

  getCurrent(): number {
    return this.currentVersion;
  }

  setVersion(v: number) {
    this.currentVersion = v;
  }
}
