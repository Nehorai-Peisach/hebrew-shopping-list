import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { Item, UpdateItemData } from '../shared/models';
import { FirestoreService } from '../core/firestore.service';
import { AuthService } from '../core/auth.service';

export interface ItemsState {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: ItemsState = {
  items: [],
  loading: false,
  error: null,
};

export const ItemsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    checkedItems: computed(() => store.items().filter((item) => item.checked)),
    uncheckedItems: computed(() => store.items().filter((item) => !item.checked)),
    cartItems: computed(() => store.items().filter((item) => item.inCart)),
    totalItems: computed(() => store.items().length),
    checkedItemsCount: computed(() => store.items().filter((item) => item.checked).length),
    uncheckedItemsCount: computed(() => store.items().filter((item) => !item.checked).length),
  })),
  withMethods((store, firestoreService = inject(FirestoreService), authService = inject(AuthService)) => ({
    loadListItems: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((listId) =>
          firestoreService.getListItems(listId).pipe(
            tap((items) =>
              patchState(store, {
                items,
                loading: false,
                error: null,
              })
            )
          )
        )
      )
    ),

    async addItem(name: string, qty: number, listId: string): Promise<string> {
      const user = authService.getUser();
      if (!user) throw new Error('User not authenticated');

      try {
        patchState(store, { loading: true, error: null });
        const itemId = await firestoreService.createItem({
          name,
          qty,
          listId,
          createdBy: user.uid,
        });
        patchState(store, { loading: false });
        return itemId;
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'נכשל בהוספת פריט',
        });
        throw error;
      }
    },

    async updateItem(itemId: string, updateData: UpdateItemData): Promise<void> {
      try {
        patchState(store, { error: null });
        await firestoreService.updateItem(itemId, updateData);
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'נכשל בעדכון פריט',
        });
        throw error;
      }
    },

    async deleteItem(itemId: string): Promise<void> {
      try {
        patchState(store, { error: null });
        await firestoreService.deleteItem(itemId);
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'נכשל במחיקת פריט',
        });
        throw error;
      }
    },

    async toggleItemChecked(itemId: string): Promise<void> {
      const item = store.items().find((i) => i.id === itemId);
      if (!item) return;

      try {
        await firestoreService.toggleItemChecked(itemId, !item.checked);
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'נכשל בשינוי סטטוס פריט',
        });
        throw error;
      }
    },

    async toggleItemInCart(itemId: string): Promise<void> {
      const item = store.items().find((i) => i.id === itemId);
      if (!item) return;

      try {
        await firestoreService.toggleItemInCart(itemId, !item.inCart);
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'נכשל בשינוי סטטוס עגלה',
        });
        throw error;
      }
    },

    clearItems(): void {
      patchState(store, { items: [], loading: false, error: null });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
