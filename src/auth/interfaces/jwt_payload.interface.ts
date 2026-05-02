import { Role } from 'src/user/enums/user.role.enum';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: Role;
}
