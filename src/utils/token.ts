import Conf from "conf";
import CryptoJS from "crypto-js";

const ENC_KEY = process.env.CHRONODB_ENC_KEY ?? "default_secret_key";
const config = new Conf({
    projectName: "chronodb"
});

export async function saveToken(token: string): Promise<void> {
    const encrypted = CryptoJS.AES.encrypt(token, ENC_KEY).toString();
    config.set("token", encrypted);
}

export async function loadToken(): Promise<string | null> {
    const encrypted = config.get("token") as string | undefined;
    if (!encrypted) return null;

    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, ENC_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return null;
    }
}

export async function deleteToken(): Promise<void> {
    config.delete("token");
}