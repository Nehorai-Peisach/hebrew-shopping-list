import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeSharp,
  listSharp,
  settingsSharp,
  exit,
  people,
  addCircle,
  personAdd,
  add,
  trash,
  close,
  person,
  calendar,
  alertCircle,
  documentText,
  list,
  cartSharp,
  checkmarkCircle,
  bagHandle,
  layersSharp,
  pencilSharp,
  share,
  logIn,
  bagCheck,
} from 'ionicons/icons';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import {
  getFirestore,
  provideFirestore,
  connectFirestoreEmulator,
  enableMultiTabIndexedDbPersistence,
} from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

// Register all ionicons
addIcons({
  homeSharp,
  listSharp,
  settingsSharp,
  exit,
  people,
  addCircle,
  personAdd,
  add,
  trash,
  close,
  person,
  calendar,
  alertCircle,
  documentText,
  list,
  cartSharp,
  checkmarkCircle,
  bagHandle,
  layersSharp,
  pencilSharp,
  share,
  logIn,
  bagCheck,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideFirestore(() => {
      const firestore = getFirestore();
      // Enable multi-tab offline persistence
      enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, using memory cache instead.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support all features required for persistence.');
        }
      });
      return firestore;
    }),
  ],
});
