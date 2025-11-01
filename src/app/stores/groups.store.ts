import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Group } from '../shared/models';
import { FirestoreService } from '../core/firestore.service';
import { AuthService } from '../core/auth.service';

export interface GroupsState {
  groups: Group[];
  selectedGroupId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  selectedGroupId: localStorage.getItem('selectedGroupId'),
  loading: false,
  error: null,
};

export const GroupsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    selectedGroup: computed(() => {
      const groupId = store.selectedGroupId();
      return store.groups().find((group) => group.id === groupId) || null;
    }),
    hasGroups: computed(() => store.groups().length > 0),
  })),
  withMethods((store, firestoreService = inject(FirestoreService), authService = inject(AuthService)) => ({
    loadUserGroups: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          firestoreService.getUserGroups(userId).pipe(
            tap((groups) =>
              patchState(store, {
                groups,
                loading: false,
                error: null,
              })
            )
          )
        )
      )
    ),

    async createGroup(name: string): Promise<void> {
      const user = authService.getUser();
      if (!user) throw new Error('User not authenticated');

      try {
        patchState(store, { loading: true, error: null });
        const groupId = await firestoreService.createGroup({
          name,
          createdBy: user.uid,
        });
        patchState(store, { loading: false });
        this.selectGroup(groupId);
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל ביצירת קבוצה',
        });
        throw error;
      }
    },

    async joinGroup(groupId: string): Promise<void> {
      const user = authService.getUser();
      if (!user) throw new Error('User not authenticated');

      try {
        patchState(store, { loading: true, error: null });

        // Check if group exists and user is not already a member
        const group = await firestoreService.getGroup(groupId);
        if (!group) {
          throw new Error('Group not found');
        }

        if (group.members.includes(user.uid)) {
          throw new Error('You are already a member of this group');
        }

        await firestoreService.joinGroup(groupId, user.uid);
        patchState(store, { loading: false });
        this.selectGroup(groupId);
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל בהצטרפות לקבוצה',
        });
        throw error;
      }
    },

    async leaveGroup(groupId: string): Promise<void> {
      const user = authService.getUser();
      if (!user) throw new Error('User not authenticated');

      try {
        patchState(store, { loading: true, error: null });
        await firestoreService.leaveGroup(groupId, user.uid);

        // If leaving the selected group, clear selection
        if (store.selectedGroupId() === groupId) {
          this.selectGroup(null);
        }

        patchState(store, { loading: false });
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל בעזיבת הקבוצה',
        });
        throw error;
      }
    },

    selectGroup(groupId: string | null): void {
      patchState(store, { selectedGroupId: groupId });
      if (groupId) {
        localStorage.setItem('selectedGroupId', groupId);
      } else {
        localStorage.removeItem('selectedGroupId');
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
