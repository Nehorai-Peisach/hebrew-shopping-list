export interface Item {
  id: string;
  name: string;
  qty: number;
  checked: boolean;
  inCart: boolean;
  listId: string;
  createdBy: string;
  imageUrl?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface CreateItemData {
  name: string;
  qty: number;
  listId: string;
  createdBy: string;
  imageUrl?: string;
}

export interface UpdateItemData {
  name?: string;
  qty?: number;
  checked?: boolean;
  inCart?: boolean;
  imageUrl?: string;
}
