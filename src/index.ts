import fs from "fs";
import { ChronoEngine } from "./engine";
import { ChronoDBOptions } from "./types";
import { resolveChronoBase } from "./utils/basePath";

export default {
    open: async (options: ChronoDBOptions = {}): Promise<ChronoEngine> => {
        const base = resolveChronoBase(options.path);;

        if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

        return new ChronoEngine(base, { cloudSync: options.cloudSync ?? true });
    }
};