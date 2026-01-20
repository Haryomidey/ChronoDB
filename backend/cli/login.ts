import { CloudUser } from '../types';

export class LoginCLI {
  private currentUser: CloudUser | null = null;

  async login(email: string, password?: string): Promise<CloudUser> {
    await new Promise(resolve => setTimeout(resolve, 500));
    this.currentUser = {
      email,
      token: `tok_${Math.random().toString(36).substr(2, 9)}`,
      isLoggedIn: true
    };
    return this.currentUser;
  }

  async signup(email: string, password?: string): Promise<CloudUser> {
    await new Promise(resolve => setTimeout(resolve, 800));
    this.currentUser = {
      email,
      token: `tok_${Math.random().toString(36).substr(2, 9)}`,
      isLoggedIn: true
    };
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }

  getUser() {
    return this.currentUser;
  }
}