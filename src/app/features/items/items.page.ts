import { Component, inject, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  IonCheckbox,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, checkmark, cart, create, trash, chevronBack } from 'ionicons/icons';
import { ItemsStore } from '../../stores/items.store';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
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
    IonCheckbox,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    FormsModule,
  ],
})
export class ItemsPage implements OnInit {
  private itemsStore = inject(ItemsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  listId: string = '';
  currentView: string = 'all';

  items = this.itemsStore.items;
  loading = this.itemsStore.loading;
  error = this.itemsStore.error;
  checkedItems = this.itemsStore.checkedItems;
  uncheckedItems = this.itemsStore.uncheckedItems;
  cartItems = this.itemsStore.cartItems;

  constructor() {
    addIcons({ add, checkmark, cart, create, trash, chevronBack });
  }

  ngOnInit() {
    this.listId = this.route.snapshot.params['id'];
    if (this.listId) {
      this.itemsStore.loadListItems(this.listId);
    } else {
      this.router.navigate(['/lists']);
    }
  }

  get filteredItems() {
    switch (this.currentView) {
      case 'unchecked':
        return this.uncheckedItems();
      case 'checked':
        return this.checkedItems();
      case 'cart':
        return this.cartItems();
      default:
        return this.items();
    }
  }

  async addItem() {
    const alert = await this.alertController.create({
      header: 'הוסף פריט',
      inputs: [
        {
          name: 'itemName',
          type: 'text',
          placeholder: 'הזן שם פריט',
        },
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'כמות',
          value: '1',
        },
      ],
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'הוסף',
          handler: async (data) => {
            if (data.itemName?.trim()) {
              try {
                const qty = parseInt(data.quantity) || 1;
                await this.itemsStore.addItem(data.itemName.trim(), qty, this.listId);
                await this.showToast('פריט נוסף בהצלחה!');
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

  async editItem(item: any) {
    const alert = await this.alertController.create({
      header: 'ערוך פריט',
      inputs: [
        {
          name: 'itemName',
          type: 'text',
          placeholder: 'הזן שם פריט',
          value: item.name,
        },
        {
          name: 'quantity',
          type: 'number',
          placeholder: 'כמות',
          value: item.qty.toString(),
        },
      ],
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'עדכן',
          handler: async (data) => {
            if (data.itemName?.trim()) {
              try {
                const qty = parseInt(data.quantity) || 1;
                await this.itemsStore.updateItem(item.id, {
                  name: data.itemName.trim(),
                  qty,
                });
                await this.showToast('פריט עודכן בהצלחה!');
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

  async deleteItem(itemId: string, itemName: string, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'מחק פריט',
      message: `האם אתה בטוח שברצונך למחוק את "${itemName}"?`,
      buttons: [
        {
          text: 'ביטול',
          role: 'cancel',
        },
        {
          text: 'מחק',
          handler: async () => {
            try {
              await this.itemsStore.deleteItem(itemId);
              await this.showToast('פריט נמחק בהצלחה!');
            } catch (error: any) {
              await this.showToast(error.message, 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async toggleItemChecked(itemId: string) {
    try {
      await this.itemsStore.toggleItemChecked(itemId);
    } catch (error: any) {
      await this.showToast(error.message, 'danger');
    }
  }

  async toggleItemInCart(itemId: string) {
    try {
      await this.itemsStore.toggleItemInCart(itemId);
    } catch (error: any) {
      await this.showToast(error.message, 'danger');
    }
  }

  goBackToLists() {
    this.router.navigate(['/lists']);
  }

  onSegmentChange(event: any) {
    this.currentView = event.detail.value;
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
