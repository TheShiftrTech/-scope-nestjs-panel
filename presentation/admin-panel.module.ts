import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdminPanel } from "../domain/model/admin-panel";
import { ADMIN_PANEL } from "../domain/constants/tokens";
import {
  AdminPanelConfig,
  adminPanelConfig,
} from "../infrastructure/config/admin-panel.config";
import { AdminPanelAuthService } from "../infrastructure/auth/admin-panel-auth.service";
import { AdminPanelAuthController } from "./admin-panel-auth.controller";

@Module({})
export class AdminPanelModule {
  static forRoot(adminPanel: AdminPanel): DynamicModule {
    return {
      module: AdminPanelModule,
      controllers: adminPanel.enabled ? [AdminPanelAuthController] : [],
      providers: [
        { provide: ADMIN_PANEL, useValue: adminPanel },
        AdminPanelAuthService,
      ],
      exports: [ADMIN_PANEL, AdminPanelAuthService],
    };
  }

  static forRootAsync(): DynamicModule {
    return {
      module: AdminPanelModule,
      imports: [ConfigModule.forFeature(adminPanelConfig)],
      providers: [
        {
          provide: ADMIN_PANEL,
          useFactory: (configService: ConfigService): AdminPanel => {
            const cfg =
              configService.getOrThrow<AdminPanelConfig>("adminPanel");
            return new AdminPanel({
              enabled: cfg.enabled,
              path: cfg.path,
              rootUser: { username: cfg.username, password: cfg.password },
              secret: cfg.secret,
            });
          },
          inject: [ConfigService],
        },
        AdminPanelAuthService,
      ],
      controllers: [AdminPanelAuthController],
      exports: [ADMIN_PANEL, AdminPanelAuthService],
    };
  }
}
