import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "./pagination-query.dto";

/**
 * Shared list-query base for admin panel list endpoints.
 * Module-specific DTOs should extend this and add domain filters.
 */
export class ListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: "Field to sort by",
    example: "createdAt",
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: "Sort direction",
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  order?: "ASC" | "DESC" = "DESC";
}
