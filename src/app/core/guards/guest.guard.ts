import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, map, filter, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private initialized$ = toObservable(this.authService.initialized);

  canActivate(): Observable<boolean> {
    // Wait for auth initialization to complete
    return this.initialized$.pipe(
      filter((initialized) => initialized), // Wait until initialized
      take(1), // Take only the first emission
      map(() => {
        if (this.authService.isAuthenticated()) {
          // User is authenticated, redirect to groups
          this.router.navigate(['/groups']);
          return false;
        } else {
          // User is not authenticated, allow access to login/register
          return true;
        }
      })
    );
  }
}
