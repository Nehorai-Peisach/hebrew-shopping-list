import { Component, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonSpinner,
  IonList,
  IonIcon,
  IonFab,
  IonFabButton,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, people, exit, settings } from 'ionicons/icons';
import { AuthService } from '../../core/auth.service';
import { GroupsStore } from '../../stores/groups.store';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonButton,
    IonText,
    IonSpinner,
    IonList,
    IonIcon,
    IonFab,
    IonFabButton,
    FormsModule,
  ],
})
export class GroupsPage implements OnInit {
  private authService = inject(AuthService);
  private groupsStore = inject(GroupsStore);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  groups = this.groupsStore.groups;
  loading = this.groupsStore.loading;
  error = this.groupsStore.error;
  user = this.authService.user;

  constructor() {
    addIcons({ add, people, exit, settings });

    // Load user groups when user changes
    effect(() => {
      const user = this.user();
      if (user) {
        this.groupsStore.loadUserGroups(user.uid);
      }
    });
  }

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.groupsStore.loadUserGroups(user.uid);
    }
  }

  async createGroup() {
    const alert = await this.alertController.create({
      header: 'צור קבוצה',
      inputs: [
        {
          name: 'groupName',
          type: 'text',
          placeholder: 'הזן שם קבוצה',
        },
      ],
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'צור',
          handler: async (data) => {
            if (data.groupName?.trim()) {
              try {
                await this.groupsStore.createGroup(data.groupName.trim());
                await this.showToast('קבוצה נוצרה בהצלחה!');
              } catch (error: any) {
                await this.showToast(error.message, 'danger');
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async joinGroup() {
    const actionSheet = await this.alertController.create({
      header: 'הצטרף לקבוצה',
      message: 'איך תרצה להצטרף לקבוצה?',
      buttons: [
        {
          text: 'הזן מזהה קבוצה',
          handler: async () => {
            await this.joinByGroupId();
          },
        },
        {
          text: 'ביטול',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  private async joinByGroupId() {
    const alert = await this.alertController.create({
      header: 'הצטרף לקבוצה',
      message: 'הזן את מזהה הקבוצה שקיבלת מיוצר הקבוצה:',
      inputs: [
        {
          name: 'groupId',
          type: 'text',
          placeholder: 'הזן מזהה קבוצה',
        },
      ],
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'הצטרף',
          handler: async (data) => {
            if (data.groupId?.trim()) {
              try {
                await this.groupsStore.joinGroup(data.groupId.trim());
                await this.showToast('הצטרפת לקבוצה בהצלחה!');
              } catch (error: any) {
                await this.showToast(error.message, 'danger');
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async selectGroup(groupId: string) {
    this.groupsStore.selectGroup(groupId);
    this.router.navigate(['/lists']);
  }

  viewGroupDetails(groupId: string) {
    this.router.navigate(['/groups', groupId]);
  }

  async leaveGroup(groupId: string, groupName: string, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'עזוב קבוצה',
      message: `האם אתה בטוח שברצונך לעזוב את "${groupName}"?`,
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'עזוב',
          handler: async () => {
            try {
              await this.groupsStore.leaveGroup(groupId);
              await this.showToast('עזבת את הקבוצה בהצלחה!');
            } catch (error: any) {
              await this.showToast(error.message, 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async signOut() {
    const alert = await this.alertController.create({
      header: 'יציאה',
      message: 'האם אתה בטוח שברצונך להתנתק?',
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'התנתק',
          handler: async () => {
            await this.authService.signOutUser();
          },
        },
      ],
    });

    await alert.present();
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
