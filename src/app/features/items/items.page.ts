import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon,
  IonFab,
  IonFabButton,
  IonBackButton,
  IonButtons,
  IonCheckbox,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, checkmark, cart, create, trash, chevronBack, listSharp, cartSharp, checkmarkCircle, bagHandle, layersSharp, image, close } from 'ionicons/icons';
import { ItemsStore } from '../../stores/items.store';
import { ImageService } from '../../core/image.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.page.html',
  styleUrls: ['./items.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
    IonFab,
    IonFabButton,
    IonBackButton,
    IonButtons,
    IonCheckbox,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class ItemsPage implements OnInit {
  private itemsStore = inject(ItemsStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private imageService = inject(ImageService);
  private authService = inject(AuthService);

  listId: string = '';
  currentView: string = 'all';
  selectedImage: { base64: string; file: File } | null = null;

  items = this.itemsStore.items;
  loading = this.itemsStore.loading;
  error = this.itemsStore.error;
  checkedItems = this.itemsStore.checkedItems;
  uncheckedItems = this.itemsStore.uncheckedItems;
  cartItems = this.itemsStore.cartItems;

  constructor() {
    addIcons({ add, checkmark, cart, create, trash, chevronBack, listSharp, cartSharp, checkmarkCircle, bagHandle, layersSharp, image, close });
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

  getEmptyStateIcon(): string {
    switch (this.currentView) {
      case 'unchecked':
        return 'cart-outline';
      case 'checked':
        return 'checkmark-circle-outline';
      case 'cart':
        return 'bag-outline';
      default:
        return 'document-text-outline';
    }
  }

  getEmptyStateTitle(): string {
    switch (this.currentView) {
      case 'unchecked':
        return 'כל הפריטים בוצעו!';
      case 'checked':
        return 'אף פריט לא בוצע';
      case 'cart':
        return 'העגלה ריקה';
      default:
        return 'אין פריטים עדיין';
    }
  }

  getEmptyStateMessage(): string {
    switch (this.currentView) {
      case 'unchecked':
        return 'יפה! סיימתם עם כל הפריטים ברשימה.';
      case 'checked':
        return 'התחילו לקנות כדי לסמן פריטים כבוצעים.';
      case 'cart':
        return 'הוסיפו פריטים לעגלה כדי לראות אותם כאן.';
      default:
        return 'הוסיפו את הפריט הראשון שלכם כדי להתחיל.';
    }
  }

  async addItem() {
    this.selectedImage = null;
    
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
          text: 'בחר תמונה',
          handler: async () => {
            await this.pickImage();
            return false;
          },
        },
        {
          text: 'ביטול',
          role: 'cancel',
          handler: () => {
            this.selectedImage = null;
          },
        },
        {
          text: 'הוסף',
          handler: async (data) => {
            if (data.itemName?.trim()) {
              try {
                const qty = parseInt(data.quantity) || 1;
                let imageUrl: string | undefined;

                if (this.selectedImage?.file) {
                  try {
                    const user = this.authService.getUser();
                    if (user) {
                      // Use a consistent ID based on timestamp
                      const tempId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                      const storagePath = `items/${user.uid}/${this.listId}/${tempId}`;
                      imageUrl = await this.imageService.uploadImage(this.selectedImage.file, storagePath);
                      console.log('Image uploaded successfully:', imageUrl);
                    }
                  } catch (imageError: any) {
                    console.error('Image upload failed:', imageError);
                    await this.showToast('שגיאה בהעלאת תמונה: ' + imageError.message, 'warning');
                    // Continue without image
                  }
                }

                await this.itemsStore.addItem(
                  data.itemName.trim(),
                  qty,
                  this.listId,
                  imageUrl
                );
                await this.showToast('פריט נוסף בהצלחה!');
                this.selectedImage = null;
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

  private async pickImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            throw new Error('בחר קובץ תמונה בלבד');
          }
          
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('תמונה גדולה מדי (מקסימום 5MB)');
          }
          
          console.log('Selected image:', { name: file.name, size: file.size, type: file.type });
          const base64 = await this.imageService.fileToBase64(file);
          this.selectedImage = { base64, file };
          await this.showToast('תמונה נבחרה! (ללחיצה על הוספה, התמונה תיעלה)');
          
          // Re-open the alert after image selection
          await this.addItem();
        } catch (error: any) {
          console.error('Image selection error:', error);
          await this.showToast(error.message || 'שגיאה בטעינת התמונה', 'danger');
        }
      }
    };
    
    input.click();
  }

  async editItem(item: any) {
    this.selectedImage = null;
    
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
          text: item.imageUrl ? 'שנה תמונה' : 'בחר תמונה',
          handler: async () => {
            await this.pickImageForEdit();
            return false;
          },
        },
        {
          text: 'ביטול',
          role: 'cancel',
          handler: () => {
            this.selectedImage = null;
          },
        },
        {
          text: 'עדכן',
          handler: async (data) => {
            if (data.itemName?.trim()) {
              try {
                const qty = parseInt(data.quantity) || 1;
                const updateData: any = {
                  name: data.itemName.trim(),
                  qty,
                };

                if (this.selectedImage?.file) {
                  try {
                    const user = this.authService.getUser();
                    if (user) {
                      const storagePath = `items/${user.uid}/${this.listId}/${item.id}`;
                      updateData.imageUrl = await this.imageService.uploadImage(
                        this.selectedImage.file,
                        storagePath
                      );
                      console.log('Image updated successfully:', updateData.imageUrl);
                    }
                  } catch (imageError: any) {
                    console.error('Image upload failed:', imageError);
                    await this.showToast('שגיאה בהעלאת תמונה: ' + imageError.message, 'warning');
                    // Continue without updating image
                  }
                }

                await this.itemsStore.updateItem(item.id, updateData);
                await this.showToast('פריט עודכן בהצלחה!');
                this.selectedImage = null;
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

  private async pickImageForEdit() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (file) {
        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            throw new Error('בחר קובץ תמונה בלבד');
          }
          
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            throw new Error('תמונה גדולה מדי (מקסימום 5MB)');
          }
          
          console.log('Selected image for edit:', { name: file.name, size: file.size, type: file.type });
          const base64 = await this.imageService.fileToBase64(file);
          this.selectedImage = { base64, file };
          await this.showToast('תמונה נבחרה! (ללחיצה על עדכון, התמונה תיעלה)');
        } catch (error: any) {
          console.error('Image selection error:', error);
          await this.showToast(error.message || 'שגיאה בטעינת התמונה', 'danger');
        }
      }
    };
    
    input.click();
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

  onImageError(event: any, itemId: string) {
    console.error('Image failed to load for item:', itemId);
    console.error('Image URL was:', event.target.src);
  }

  clearError() {
    this.itemsStore.clearError();
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

