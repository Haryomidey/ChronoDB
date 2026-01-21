#!/usr/bin/env node
import http from "http";
import open from "open";
import { randomUUID } from "crypto";
import { ChronoEngine } from "./engine";
import { saveToken, loadToken } from "./utils/token";
import { getAvailablePort } from "./utils/port";

const args = process.argv.slice(2);

const LOGIN_SUCCESS_URL = "http://127.0.0.1:5500/login-success.html";
const LOGIN_ERROR_URL = "http://127.0.0.1:5500/login-error.html";

async function login(): Promise<void> {
    const sessionId = randomUUID();
    const port = await getAvailablePort();

    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url ?? "", `http://localhost:${port}`);

        if (url.pathname !== "/callback") {
            res.writeHead(404);
            res.end("Not found");
            return;
        }

        const token = url.searchParams.get("token");

        if (!token) {
            res.writeHead(302, { Location: LOGIN_ERROR_URL });
            res.end();
            server.close();
            console.log("❌ Authentication failed");
            return;
        }

        await saveToken(token);

        res.writeHead(302, { Location: LOGIN_SUCCESS_URL });
        res.end();

        console.log("✔ Authenticated successfully");
        server.close();
    });

    server.listen(port, async () => {
        console.log("🔐 Opening browser for authentication...");
        await open("http://127.0.0.1:5500/login.html" + `?session=${sessionId}&redirect=http://localhost:${port}/callback`);
    });
}

async function authStatus(): Promise<void> {
    const token = await loadToken();

    if (!token) {
        console.log("❌ Not authenticated");
        return;
    }

    console.log("✔ Authenticated");
}

async function main(): Promise<void> {
    if (args[0] === "login") {
        await login();
        return;
    }

    if (args[0] === "auth" && args[1] === "status") {
        await authStatus();
        return;
    }

    if (args[0] === "snapshots") {
        const db = new ChronoEngine(process.cwd());

        if (args[1] === "list") {
            console.table(await db.snapshots.list());
            return;
        }

        if (args[1] === "delete" && args[2]) {
            await db.snapshots.delete(args[2]);
            console.log("✔ Snapshot deleted");
            return;
        }

        if (args[1] === "delete-all") {
            await db.snapshots.deleteAll();
            console.log("✔ All snapshots deleted");
            return;
        }
    }

    console.log("");
    console.log("ChronoDB CLI");
    console.log("");
    console.log("Commands:");
    console.log("  chronodb login");
    console.log("  chronodb auth status");
    console.log("  chronodb snapshots list");
    console.log("  chronodb snapshots delete <id>");
    console.log("  chronodb snapshots delete-all");
    console.log("");
}

main();