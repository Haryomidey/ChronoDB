import axios, { AxiosInstance } from "axios";

export class HttpClient {
    private client: AxiosInstance;

    constructor(baseURL: string, token?: string) {
        this.client = axios.create({
            baseURL,
            timeout: 15000,
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : undefined
        });
    }

    async get<T>(url: string): Promise<T> {
        const res = await this.client.get<T>(url);
        return res.data;
    }

    async post<T>(url: string, body: unknown): Promise<T> {
        const res = await this.client.post<T>(url, body);
        return res.data;
    }
}