import { UserResponse } from "@shared/generated/user.proto";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signIn(user: UserResponse): Promise<string> {
    return await this.jwtService.signAsync(
      { uid: user.uid },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXP"),
      },
    );
  }
}
