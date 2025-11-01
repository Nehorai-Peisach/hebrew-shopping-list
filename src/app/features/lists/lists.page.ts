import { Component, inject, OnInit, effect } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
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
  IonBackButton,
  IonButtons,
  IonBadge,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, list, trash, chevronBack } from 'ionicons/icons';
import { GroupsStore } from '../../stores/groups.store';
import { ListsStore } from '../../stores/lists.store';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.page.html',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
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
    IonBackButton,
    IonButtons,
    IonBadge,
  ],
})
export class ListsPage implements OnInit {
  private groupsStore = inject(GroupsStore);
  private listsStore = inject(ListsStore);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  selectedGroup = this.groupsStore.selectedGroup;
  lists = this.listsStore.lists;
  loading = this.listsStore.loading;
  error = this.listsStore.error;

  constructor() {
    addIcons({ add, list, trash, chevronBack });

    // Load lists when selected group changes
    effect(() => {
      const group = this.selectedGroup();
      if (group) {
        this.listsStore.loadGroupLists(group.id);
      } else {
        this.listsStore.clearLists();
      }
    });
  }

  ngOnInit() {
    // If no group is selected, redirect to groups
    if (!this.selectedGroup()) {
      this.router.navigate(['/groups']);
      return;
    }
  }

  async createList() {
    const group = this.selectedGroup();
    if (!group) return;

    const alert = await this.alertController.create({
      header: 'צור רשימה',
      inputs: [
        {
          name: 'listName',
          type: 'text',
          placeholder: 'הזן שם רשימה',
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
            if (data.listName?.trim()) {
              try {
                await this.listsStore.createList(data.listName.trim(), group.id);
                await this.showToast('רשימה נוצרה בהצלחה!');
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

  openList(listId: string) {
    this.router.navigate(['/items', listId]);
  }

  async deleteList(listId: string, listName: string, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'מחק רשימה',
      message: `האם אתה בטוח שברצונך למחוק את "${listName}"? פעולה זו תמחק גם את כל הפריטים ברשימה.`,
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'מחק',
          handler: async () => {
            try {
              await this.listsStore.deleteList(listId);
              await this.showToast('רשימה נמחקה בהצלחה!');
            } catch (error: any) {
              await this.showToast(error.message, 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  goBackToGroups() {
    this.router.navigate(['/groups']);
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
