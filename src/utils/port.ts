import net from "net";

export async function getAvailablePort(start = 53682): Promise<number> {
    let port = start;

    while (true) {
        const isFree = await new Promise<boolean>(resolve => {
            const server = net.createServer()
                .once("error", () => resolve(false))
                .once("listening", () => {
                    server.close();
                    resolve(true);
                })
                .listen(port);
        });

        if (isFree) {
            return port;
        }

        port++;
    }
}