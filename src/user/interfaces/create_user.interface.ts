import { Role } from '../enums/user.role.enum';

export interface CreateUser {
  phone_number: string;
  first_name: string | null;
  last_name: string;
  role: Role;
}
