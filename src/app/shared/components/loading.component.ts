import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  template: `
    <ion-content class="ion-padding" [fullscreen]="true">
      <div class="loading-container">
        <ion-spinner name="crescent" color="primary"></ion-spinner>
        <ion-text color="medium">
          <h3>Loading...</h3>
        </ion-text>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 1rem;
      }

      ion-spinner {
        transform: scale(1.5);
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class LoadingComponent {}
