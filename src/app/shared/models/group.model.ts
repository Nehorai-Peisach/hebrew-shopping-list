export interface Group {
  id: string;
  name: string;
  members: string[];
  createdAt: Date;
  createdBy: string;
}

export interface CreateGroupData {
  name: string;
  createdBy: string;
}
