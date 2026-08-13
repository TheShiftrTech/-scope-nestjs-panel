import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "crypto";
import { AdminPanel } from "../../domain/model/admin-panel";
import { ADMIN_PANEL } from "../../domain/constants/tokens";

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

@Injectable()
export class AdminPanelAuthService {
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  constructor(@Inject(ADMIN_PANEL) private readonly adminPanel: AdminPanel) {}

  login(
    username: string,
    password: string,
  ): { accessToken: string; expiresIn: number } {
    const { rootUser, secret } = this.adminPanel;

    const usernameMatch = this.safeCompare(username, rootUser.username);
    const passwordMatch = this.safeCompare(password, rootUser.password);

    if (!usernameMatch || !passwordMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const now = Date.now();
    const payload: TokenPayload = {
      sub: username,
      iat: now,
      exp: now + this.tokenTtlMs,
    };

    const accessToken = this.signToken(payload, secret);

    return {
      accessToken,
      expiresIn: Math.floor(this.tokenTtlMs / 1000),
    };
  }

  verifyToken(token: string): TokenPayload {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) {
      throw new UnauthorizedException("Invalid token");
    }

    const expectedSig = this.createSignature(
      payloadB64,
      this.adminPanel.secret,
    );
    if (!this.safeCompare(signature, expectedSig)) {
      throw new UnauthorizedException("Invalid token");
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as TokenPayload;

    if (payload.exp < Date.now()) {
      throw new UnauthorizedException("Token expired");
    }

    return payload;
  }

  private signToken(payload: TokenPayload, secret: string): string {
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );
    const signature = this.createSignature(payloadB64, secret);
    return `${payloadB64}.${signature}`;
  }

  private createSignature(payloadB64: string, secret: string): string {
    return createHmac("sha256", secret).update(payloadB64).digest("base64url");
  }

  private safeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  }
}
