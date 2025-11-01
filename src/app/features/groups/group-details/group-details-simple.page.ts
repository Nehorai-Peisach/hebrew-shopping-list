import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonList,
  IonIcon,
  IonChip,
  IonSpinner,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { people, person, add, share, copy, list, basket, settings } from 'ionicons/icons';
import { FirestoreService } from '../../../core/firestore.service';
import { AuthService } from '../../../core/auth.service';
import { Group } from '../../../shared/models';

@Component({
  selector: 'app-group-details',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/groups"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ group()?.name || 'פרטי קבוצה' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div *ngIf="loading()" class="loading-container">
        <ion-spinner></ion-spinner>
        <ion-text>טוען פרטי קבוצה...</ion-text>
      </div>

      <div *ngIf="!loading() && group()">
        <!-- Group Info Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              <ion-icon name="people"></ion-icon>
              {{ group()?.name }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-icon name="person" slot="start"></ion-icon>
              <ion-label>
                <h3>בעלים</h3>
                <p>{{ ownerEmail() || 'טוען...' }}</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-icon name="people" slot="start"></ion-icon>
              <ion-label>
                <h3>חברים</h3>
                <p>{{ group()?.members?.length || 0 }} חברים</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-icon name="list" slot="start"></ion-icon>
              <ion-label>
                <h3>רשימות קניות</h3>
                <p>{{ listCount() }} רשימות</p>
              </ion-label>
            </ion-item>

            <ion-item lines="none">
              <ion-icon name="basket" slot="start"></ion-icon>
              <ion-label>
                <h3>סה"כ פריטים</h3>
                <p>{{ itemCount() }} פריטים</p>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Actions Card -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>פעולות קבוצה</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-button expand="block" fill="outline" color="primary" (click)="inviteMembers()">
              <ion-icon name="add" slot="start"></ion-icon>
              הזמן חברים
            </ion-button>

            <ion-button expand="block" fill="outline" color="secondary" (click)="shareGroupId()">
              <ion-icon name="copy" slot="start"></ion-icon>
              שתף מזהה קבוצה
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Members List -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>חברים ({{ group()?.members?.length || 0 }})</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngFor="let memberId of group()?.members" lines="inset">
                <ion-icon name="person" slot="start"></ion-icon>
                <ion-label>
                  <h3>{{ getMemberEmail(memberId) }}</h3>
                  <p *ngIf="memberId === group()?.createdBy">
                    <ion-chip color="primary">בעלים</ion-chip>
                  </p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>
      </div>

      <div *ngIf="!loading() && !group()" class="error-container">
        <ion-text color="danger">
          <h2>קבוצה לא נמצאה</h2>
          <p>הקבוצה שאתה מחפש לא קיימת או שאין לך גישה אליה.</p>
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
        height: 200px;
        gap: 16px;
      }

      .error-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 200px;
        text-align: center;
        padding: 20px;
      }

      ion-card-title ion-icon {
        margin-right: 8px;
      }

      ion-item ion-icon[slot='start'] {
        margin-right: 12px;
      }

      ion-button {
        margin: 8px 0;
      }
    `,
  ],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonList,
    IonIcon,
    IonChip,
    IonSpinner,
  ],
})
export class GroupDetailsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private firestoreService = inject(FirestoreService);
  private authService = inject(AuthService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private actionSheetController = inject(ActionSheetController);

  group = signal<Group | null>(null);
  loading = signal(true);
  ownerEmail = signal<string>('');
  listCount = signal<number>(0);
  itemCount = signal<number>(0);

  constructor() {
    addIcons({ people, person, add, share, copy, list, basket, settings });
  }

  async ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('id');
    if (groupId) {
      await this.loadGroup(groupId);
      await this.loadGroupStats(groupId);
    }
  }

  async loadGroup(groupId: string) {
    try {
      this.loading.set(true);
      const group = await this.firestoreService.getGroup(groupId);
      this.group.set(group);

      if (group) {
        // Set owner email if it's the current user, otherwise show User ID
        const currentUser = this.authService.user();
        if (group.createdBy === currentUser?.uid) {
          this.ownerEmail.set(currentUser.email);
        } else {
          this.ownerEmail.set(`User ID: ${group.createdBy}`);
        }
      }
    } catch (error) {
      console.error('Error loading group:', error);
      await this.showToast('נכשל בטעינת פרטי הקבוצה', 'danger');
      this.router.navigate(['/groups']);
    } finally {
      this.loading.set(false);
    }
  }

  async loadGroupStats(groupId: string) {
    try {
      // Load lists using the observable but convert to promise
      const lists$ = this.firestoreService.getGroupLists(groupId);
      const lists = await new Promise<any[]>((resolve) => {
        lists$.subscribe((lists) => resolve(lists));
      });

      this.listCount.set(lists.length);

      // Load total items count across all lists
      let totalItems = 0;
      for (const list of lists) {
        const items$ = this.firestoreService.getListItems(list.id);
        const items = await new Promise<any[]>((resolve) => {
          items$.subscribe((items) => resolve(items));
        });
        totalItems += items.length;
      }
      this.itemCount.set(totalItems);
    } catch (error) {
      console.error('Error loading group stats:', error);
    }
  }

  getMemberEmail(memberId: string): string {
    const currentUser = this.authService.user();
    if (memberId === currentUser?.uid) {
      return currentUser.email + ' (אתה)';
    }
    return `מזהה משתמש: ${memberId}`;
  }

  async inviteMembers() {
    const actionSheet = await this.actionSheetController.create({
      header: 'הזמן חברים',
      buttons: [
        {
          text: 'שתף מזהה קבוצה',
          icon: 'copy',
          handler: () => {
            this.shareGroupId();
          },
        },
        {
          text: 'שתף קישור הזמנה',
          icon: 'share',
          handler: () => {
            this.shareInviteLink();
          },
        },
        {
          text: 'ביטול',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  async shareGroupId() {
    const group = this.group();
    if (!group) return;

    try {
      await navigator.clipboard.writeText(group.id);
      await this.showToast('מזהה הקבוצה הועתק ללוח!');
    } catch (error) {
      // Fallback for older browsers
      const alert = await this.alertController.create({
        header: 'מזהה קבוצה',
        message: `שתף את מזהה הקבוצה הזה עם אחרים: ${group.id}`,
        buttons: ['אישור'],
      });
      await alert.present();
    }
  }

  async shareInviteLink() {
    const group = this.group();
    if (!group) return;

    const inviteText = `הצטרף לקבוצת הקניות שלי "${group.name}"! השתמש במזהה הקבוצה הזה: ${group.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'הצטרף לקבוצת קניות',
          text: inviteText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(inviteText);
        await this.showToast('הודעת ההזמנה הועתקה ללוח!');
      } catch (error) {
        const alert = await this.alertController.create({
          header: 'הזמן חברים',
          message: inviteText,
          buttons: ['אישור'],
        });
        await alert.present();
      }
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
    });
    await toast.present();
  }
}
