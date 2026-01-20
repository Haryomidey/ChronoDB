import { CloudUser } from '../types';

// Safe storage wrapper for Node/Browser compatibility
const storage = {
  getItem: (key: string) => {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    return null;
  },
  setItem: (key: string, value: string) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  }
};

export class LoginCLI {
  private currentUser: CloudUser | null = null;
  private awaitingToken: boolean = false;

  constructor() {
    const saved = storage.getItem('chronodb_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  async setSession(user: any, token: string) {
    this.currentUser = {
      ...user,
      token,
      isLoggedIn: true,
      createdAt: Date.now()
    };
    storage.setItem('chronodb_session', JSON.stringify(this.currentUser));
  }

  async login(email: string, password?: string): Promise<CloudUser> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    this.currentUser = {
      id: typeof btoa !== 'undefined' ? btoa(email) : Buffer.from(email).toString('base64'),
      email,
      token: `jwt_${Math.random().toString(36).substr(2, 20)}`,
      isLoggedIn: true,
      createdAt: Date.now()
    };

    storage.setItem('chronodb_session', JSON.stringify(this.currentUser));
    
    // If we're in the browser and have a cli_port, redirect back
    if (typeof window !== 'undefined' && window.location.hash) {
      const params = new URLSearchParams(window.location.hash.split('?')[1]);
      const port = params.get('cli_port');
      if (port) {
        window.location.href = `http://localhost:${port}/token?token=${this.currentUser.token}&email=${email}`;
      }
    }

    return this.currentUser;
  }

  async signup(email: string, password?: string): Promise<CloudUser> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.login(email);
  }

  logout() {
    this.currentUser = null;
    storage.removeItem('chronodb_session');
  }

  getUser() {
    return this.currentUser;
  }

  setAwaitingToken(val: boolean) {
    this.awaitingToken = val;
  }

  isAwaitingToken() {
    return this.awaitingToken;
  }
}