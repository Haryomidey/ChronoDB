
import { CloudUser } from '../types';

export class LoginCLI {
  private currentUser: CloudUser | null = null;
  private awaitingToken: boolean = false;

  constructor() {
    // Try to restore session from storage (simulated)
    const saved = localStorage.getItem('chronodb_session');
    if (saved) {
      this.currentUser = JSON.parse(saved);
    }
  }

  async login(email: string, password?: string): Promise<CloudUser> {
    // Simulate API call to backend
    await new Promise(resolve => setTimeout(resolve, 600));
    
    this.currentUser = {
      id: btoa(email),
      email,
      token: `jwt_${Math.random().toString(36).substr(2, 20)}`,
      isLoggedIn: true,
      createdAt: Date.now()
    };

    localStorage.setItem('chronodb_session', JSON.stringify(this.currentUser));
    return this.currentUser;
  }

  async signup(email: string, password?: string): Promise<CloudUser> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.login(email);
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('chronodb_session');
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
