import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AutoRedirectService {
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    // Effect that runs when authentication state changes
    effect(() => {
      const isInitialized = this.authService.initialized();
      const user = this.authService.user();
      const currentUrl = this.router.url;

      if (isInitialized) {
        if (user) {
          // User is authenticated
          if (currentUrl.startsWith('/auth') || currentUrl === '/') {
            // Redirect authenticated users away from auth pages to groups
            this.router.navigate(['/groups']);
          }
        } else {
          // User is not authenticated
          if (!currentUrl.startsWith('/auth')) {
            // Redirect unauthenticated users to login
            this.router.navigate(['/auth/login']);
          }
        }
      }
    });
  }
}
