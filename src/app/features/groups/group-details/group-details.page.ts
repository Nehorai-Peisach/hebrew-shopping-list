import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonList,
  IonIcon,
  IonBackButton,
  IonButtons,
  IonChip,
  IonSpinner,
  AlertController,
  ToastController,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { people, person, add, share, copy, settings, trash, exit } from 'ionicons/icons';
import { FirestoreService } from '../../../core/firestore.service';
import { AuthService } from '../../../core/auth.service';
import { Group } from '../../../shared/models';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    IonList,
    IonIcon,
    IonBackButton,
    IonButtons,
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
  user = this.authService.user;

  constructor() {
    addIcons({ people, person, add, share, copy, settings, trash, exit });
  }

  async ngOnInit() {
    const groupId = this.route.snapshot.paramMap.get('id');
    if (groupId) {
      await this.loadGroup(groupId);
    }
  }

  async loadGroup(groupId: string) {
    try {
      this.loading.set(true);
      const group = await this.firestoreService.getGroup(groupId);
      this.group.set(group);
    } catch (error) {
      console.error('Error loading group:', error);
      await this.showToast('Failed to load group details', 'danger');
      this.router.navigate(['/groups']);
    } finally {
      this.loading.set(false);
    }
  }

  async inviteMembers() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Invite Members',
      buttons: [
        {
          text: 'Share Group ID',
          icon: 'copy',
          handler: () => {
            this.shareGroupId();
          },
        },
        {
          text: 'Share Invite Link',
          icon: 'share',
          handler: () => {
            this.shareInviteLink();
          },
        },
        {
          text: 'Cancel',
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

    const alert = await this.alertController.create({
      header: 'Share Group ID',
      message: `Share this ID with people you want to invite to "${group.name}":`,
      inputs: [
        {
          name: 'groupId',
          type: 'text',
          value: group.id,
          attributes: {
            readonly: true,
          },
        },
      ],
      buttons: [
        {
          text: 'Copy',
          handler: () => {
            this.copyToClipboard(group.id);
          },
        },
        {
          text: 'Share',
          handler: () => {
            this.shareText(`Join my shopping group "${group.name}" using ID: ${group.id}`);
          },
        },
        {
          text: 'Done',
          role: 'cancel',
        },
      ],
    });

    await alert.present();
  }

  async shareInviteLink() {
    const group = this.group();
    if (!group) return;

    const inviteLink = `${window.location.origin}/invite/${group.id}`;
    await this.shareText(`Join my shopping group "${group.name}": ${inviteLink}`);
  }

  async copyToClipboard(text: string) {
    try {
      // Use modern clipboard API
      await navigator.clipboard.writeText(text);
      await this.showToast('Copied to clipboard!');
    } catch (error) {
      // Fallback method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      await this.showToast('Copied to clipboard!');
    }
  }

  async shareText(text: string) {
    try {
      if (navigator.share) {
        await navigator.share({
          text: text,
        });
      } else {
        await this.copyToClipboard(text);
        await this.showToast('Link copied to clipboard!');
      }
    } catch (error) {
      await this.copyToClipboard(text);
      await this.showToast('Link copied to clipboard!');
    }
  }

  async leaveGroup() {
    const group = this.group();
    const user = this.user();
    if (!group || !user) return;

    const alert = await this.alertController.create({
      header: 'Leave Group',
      message: `Are you sure you want to leave "${group.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Leave',
          handler: async () => {
            try {
              await this.firestoreService.leaveGroup(group.id, user.uid);
              await this.showToast('Left group successfully!');
              this.router.navigate(['/groups']);
            } catch (error: any) {
              await this.showToast(error.message, 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteGroup() {
    const group = this.group();
    const user = this.user();
    if (!group || !user || group.createdBy !== user.uid) return;

    const alert = await this.alertController.create({
      header: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              // Note: You'll need to implement deleteGroup in FirestoreService
              await this.showToast('Group deletion not implemented yet', 'warning');
              // await this.firestoreService.deleteGroup(group.id);
              // await this.showToast('Group deleted successfully!');
              // this.router.navigate(['/groups']);
            } catch (error: any) {
              await this.showToast(error.message, 'danger');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  isGroupCreator(): boolean {
    const group = this.group();
    const user = this.user();
    return !!(group && user && group.createdBy === user.uid);
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
