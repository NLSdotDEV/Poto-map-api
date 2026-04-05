import { IsNumber, IsOptional } from 'class-validator';

export class QueryDto {
  @IsNumber()
  @IsOptional()
  per_page: number = 10;

  @IsNumber()
  @IsOptional()
  page: number = 1;
}
