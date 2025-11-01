export interface Item {
  id: string;
  name: string;
  qty: number;
  checked: boolean;
  inCart: boolean;
  listId: string;
  createdBy: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface CreateItemData {
  name: string;
  qty: number;
  listId: string;
  createdBy: string;
}

export interface UpdateItemData {
  name?: string;
  qty?: number;
  checked?: boolean;
  inCart?: boolean;
}
