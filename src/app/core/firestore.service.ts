import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Group, List, Item, CreateGroupData, CreateListData, CreateItemData, UpdateItemData } from '../shared/models';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  constructor() {
    // Persistence is now handled in main.ts
  }

  // Groups
  async createGroup(groupData: CreateGroupData): Promise<string> {
    const groupsRef = collection(this.firestore, 'groups');
    const docData = {
      ...groupData,
      members: [groupData.createdBy],
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(groupsRef, docData);
    return docRef.id;
  }

  async getGroup(groupId: string): Promise<Group | null> {
    const groupRef = doc(this.firestore, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const data = groupSnap.data();
      return {
        id: groupSnap.id,
        ...data,
        createdAt: data['createdAt'].toDate(),
      } as Group;
    }
    return null;
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(this.firestore, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayUnion(userId),
    });
  }

  async leaveGroup(groupId: string, userId: string): Promise<void> {
    const groupRef = doc(this.firestore, 'groups', groupId);
    await updateDoc(groupRef, {
      members: arrayRemove(userId),
    });
  }

  getUserGroups(userId: string): Observable<Group[]> {
    return new Observable((observer) => {
      runInInjectionContext(this.injector, () => {
        const groupsRef = collection(this.firestore, 'groups');
        const q = query(groupsRef, where('members', 'array-contains', userId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const groups: Group[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            groups.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt'].toDate(),
            } as Group);
          });
          observer.next(groups);
        });

        return () => unsubscribe();
      });
    });
  }

  // Lists
  async createList(listData: CreateListData): Promise<string> {
    const listsRef = collection(this.firestore, 'lists');
    const docData = {
      ...listData,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(listsRef, docData);
    return docRef.id;
  }

  async deleteList(listId: string): Promise<void> {
    // First delete all items in the list
    const itemsRef = collection(this.firestore, 'items');
    const itemsQuery = query(itemsRef, where('listId', '==', listId));
    const itemsSnapshot = await getDocs(itemsQuery);

    const deletePromises = itemsSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Then delete the list
    const listRef = doc(this.firestore, 'lists', listId);
    await deleteDoc(listRef);
  }

  getGroupLists(groupId: string): Observable<List[]> {
    return new Observable((observer) => {
      runInInjectionContext(this.injector, () => {
        const listsRef = collection(this.firestore, 'lists');
        // Temporarily remove orderBy until index is built
        const q = query(listsRef, where('groupId', '==', groupId));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const lists: List[] = [];

          for (const doc of snapshot.docs) {
            const data = doc.data();

            // Count items for this list
            const itemsRef = collection(this.firestore, 'items');
            const itemsQuery = query(itemsRef, where('listId', '==', doc.id));
            const itemsSnapshot = await getDocs(itemsQuery);

            lists.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt'].toDate(),
              itemCount: itemsSnapshot.size,
            } as List);
          }

          // Sort by createdAt in descending order (client-side)
          lists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          observer.next(lists);
        });

        return () => unsubscribe();
      });
    });
  }

  // Items
  async createItem(itemData: CreateItemData): Promise<string> {
    const itemsRef = collection(this.firestore, 'items');
    const docData = {
      ...itemData,
      checked: false,
      inCart: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(itemsRef, docData);
    return docRef.id;
  }

  async updateItem(itemId: string, updateData: UpdateItemData): Promise<void> {
    const itemRef = doc(this.firestore, 'items', itemId);
    await updateDoc(itemRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteItem(itemId: string): Promise<void> {
    const itemRef = doc(this.firestore, 'items', itemId);
    await deleteDoc(itemRef);
  }

  async toggleItemChecked(itemId: string, checked: boolean): Promise<void> {
    await this.updateItem(itemId, { checked });
  }

  async toggleItemInCart(itemId: string, inCart: boolean): Promise<void> {
    await this.updateItem(itemId, { inCart });
  }

  getListItems(listId: string): Observable<Item[]> {
    return new Observable((observer) => {
      runInInjectionContext(this.injector, () => {
        const itemsRef = collection(this.firestore, 'items');
        // Temporarily remove orderBy until index is built
        const q = query(itemsRef, where('listId', '==', listId));

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items: Item[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              ...data,
              createdAt: data['createdAt'].toDate(),
              updatedAt: data['updatedAt'].toDate(),
            } as Item);
          });

          // Sort by createdAt in descending order (client-side)
          items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          observer.next(items);
        });

        return () => unsubscribe();
      });
    });
  }

  // Utility method to check if user is member of group
  async isUserMemberOfGroup(groupId: string, userId: string): Promise<boolean> {
    const group = await this.getGroup(groupId);
    return group ? group.members.includes(userId) : false;
  }
}
