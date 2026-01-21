import path from "path";

export function resolveChronoBase(customPath?: string): string {
    return customPath ?? path.join(process.cwd(), "ChronoDB");
}