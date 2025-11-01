export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
