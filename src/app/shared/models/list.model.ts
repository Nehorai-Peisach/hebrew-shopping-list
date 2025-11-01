export interface List {
  id: string;
  name: string;
  groupId: string;
  createdBy: string;
  createdAt: Date;
  itemCount?: number;
}

export interface CreateListData {
  name: string;
  groupId: string;
  createdBy: string;
}
