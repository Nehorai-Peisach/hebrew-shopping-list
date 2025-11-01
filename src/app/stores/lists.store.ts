import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { List } from '../shared/models';
import { FirestoreService } from '../core/firestore.service';
import { AuthService } from '../core/auth.service';

export interface ListsState {
  lists: List[];
  loading: boolean;
  error: string | null;
}

const initialState: ListsState = {
  lists: [],
  loading: false,
  error: null,
};

export const ListsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasLists: computed(() => store.lists().length > 0),
    totalLists: computed(() => store.lists().length),
  })),
  withMethods((store, firestoreService = inject(FirestoreService), authService = inject(AuthService)) => ({
    loadGroupLists: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((groupId) =>
          firestoreService.getGroupLists(groupId).pipe(
            tap((lists) =>
              patchState(store, {
                lists,
                loading: false,
                error: null,
              })
            )
          )
        )
      )
    ),

    async createList(name: string, groupId: string): Promise<string> {
      const user = authService.getUser();
      if (!user) throw new Error('User not authenticated');

      try {
        patchState(store, { loading: true, error: null });
        const listId = await firestoreService.createList({
          name,
          groupId,
          createdBy: user.uid,
        });
        patchState(store, { loading: false });
        return listId;
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל ביצירת רשימה',
        });
        throw error;
      }
    },

    async deleteList(listId: string): Promise<void> {
      try {
        patchState(store, { loading: true, error: null });
        await firestoreService.deleteList(listId);
        patchState(store, { loading: false });
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל במחיקת רשימה',
        });
        throw error;
      }
    },

    clearLists(): void {
      patchState(store, { lists: [], loading: false, error: null });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
