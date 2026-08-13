import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  tokenType!: string;

  @ApiProperty()
  expiresIn!: number;
}
