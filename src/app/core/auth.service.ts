import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Reactive state using signals
  private _user = signal<User | null>(null);
  private _loading = signal<boolean>(true); // Start with loading true
  private _error = signal<string | null>(null);
  private _initialized = signal<boolean>(false);

  // Public readonly signals
  public readonly user = this._user.asReadonly();
  public readonly loading = this._loading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly initialized = this._initialized.asReadonly();

  constructor() {
    // Listen to auth state changes for persistent authentication
    onAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        };
        this._user.set(user);
      } else {
        this._user.set(null);
      }
      this._loading.set(false);
      this._initialized.set(true);
    });
  }

  async signUp(email: string, password: string): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);
      await createUserWithEmailAndPassword(this.auth, email, password);
      // Navigation will be handled by AutoRedirectService
    } catch (error: any) {
      this._error.set(error.message);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);
      await signInWithEmailAndPassword(this.auth, email, password);
      // Navigation will be handled by AutoRedirectService
    } catch (error: any) {
      this._error.set(error.message);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async signOutUser(): Promise<void> {
    try {
      this._loading.set(true);
      this._error.set(null);
      await signOut(this.auth);
      this.router.navigate(['/auth/login']);
    } catch (error: any) {
      this._error.set(error.message);
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  getUser(): User | null {
    return this._user();
  }

  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  clearError(): void {
    this._error.set(null);
  }
}
