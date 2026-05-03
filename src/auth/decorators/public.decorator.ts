import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isRoutePublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);
