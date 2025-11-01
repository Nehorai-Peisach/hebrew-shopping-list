import { Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-test',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Test Page</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <h1>Test page is working!</h1>
    </ion-content>
  `,
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
})
export class TestPage {}
