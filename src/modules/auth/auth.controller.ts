import {
  AuthServiceController,
  AuthServiceControllerMethods,
  SignIn,
  Token,
} from "@shared/generated/auth.proto";
import {
  SuccessResponse,
  Uid,
} from "@shared/generated/messages/messages.proto";
import {
  CreateUserRequest,
  UserServiceClient,
} from "@shared/generated/user.proto";
import { USER_SERVICE_NAME } from "@shared/generated/user.proto";
import { grpcClientOptions } from "@shared/options/user.option";
import { Observable, firstValueFrom } from "rxjs";

import { Controller, OnModuleInit } from "@nestjs/common";
import { Client, ClientGrpc, RpcException } from "@nestjs/microservices";

import { AuthService } from "./auth.service";

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController, OnModuleInit {
  @Client(grpcClientOptions)
  private client!: ClientGrpc;
  private userService!: UserServiceClient;

  constructor(private readonly authService: AuthService) {}
  validateToken(request: Token): Promise<Uid> | Observable<Uid> | Uid {
    return this.authService.validateToken(request.token).then((uid) => ({
      uid,
    }));
  }

  onModuleInit() {
    this.userService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  signIn(request: SignIn): Token | Promise<Token> | Observable<Token> {
    return firstValueFrom(this.userService.getUserById({ id: request.id }))
      .then((user) =>
        this.authService.signIn(user).then((token) => ({ token })),
      )
      .catch((error) => {
        console.log(error);
        throw new RpcException({ code: 404, message: "User not found" });
      });
  }

  signUp(
    request: CreateUserRequest,
  ): Promise<SuccessResponse> | Observable<SuccessResponse> | SuccessResponse {
    return firstValueFrom(this.userService.createUser({ user: request })).then(
      () => ({ success: true }),
    );
  }
}
