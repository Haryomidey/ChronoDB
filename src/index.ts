import path from "path";
import { ChronoEngine } from "./engine";
import { ChronoDBOptions } from "./types";

export default {
    open: async (options: ChronoDBOptions): Promise<ChronoEngine> => {
        const base =
            options.path ??
            path.join(process.cwd(), "ChronoDB");

        return new ChronoEngine(base);
    }
};