import { Body, Controller, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminPanelAuthService } from "../infrastructure/auth/admin-panel-auth.service";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { AdminLoginResponseDto } from "./dto/admin-login.response.dto";

@ApiTags("Admin Panel")
@Controller("admin-panel")
export class AdminPanelAuthController {
  constructor(private readonly authService: AdminPanelAuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Admin panel login" })
  @ApiOkResponse({ type: AdminLoginResponseDto })
  login(@Body() dto: AdminLoginDto): AdminLoginResponseDto {
    const { accessToken, expiresIn } = this.authService.login(
      dto.username,
      dto.password,
    );

    return {
      accessToken,
      tokenType: "Bearer",
      expiresIn,
    };
  }
}
