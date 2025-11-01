import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/auth.service';
import { AutoRedirectService } from './core/auto-redirect.service';
import { LoadingComponent } from './shared/components/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, LoadingComponent, CommonModule],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private autoRedirectService = inject(AutoRedirectService); // Initialize the service
  private renderer = inject(Renderer2);

  // Expose auth loading state to template
  get isAuthLoading() {
    return this.authService.loading();
  }

  get isAuthInitialized() {
    return this.authService.initialized();
  }

  constructor() {}

  ngOnInit() {
    // Ensure RTL direction is set globally
    this.renderer.setAttribute(document.documentElement, 'dir', 'rtl');
    this.renderer.setAttribute(document.documentElement, 'lang', 'he');
  }
}
