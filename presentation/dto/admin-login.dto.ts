import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
  @ApiProperty({ example: "admin" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: "admin" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
