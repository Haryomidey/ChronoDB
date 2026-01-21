import fs from "fs";
import path from "path";

export function ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function readJSON<T>(file: string, fallback: T): T {
    if (!fs.existsSync(file)) {
        return fallback;
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJSON(file: string, data: unknown): void {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, JSON.stringify(data, null, 4));
}