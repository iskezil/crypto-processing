export type User = {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  roles: number[];
};

export type Role = { id: number; name: string };

export type Filters = { keyword: string; role: number | null; status: string };
