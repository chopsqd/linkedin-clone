import { Body, Controller, Post } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { User, UserSafe } from "../models/user.class";
import { AuthService } from "../services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(
    @Body() user: User
  ): Observable<UserSafe> {
    return this.authService.registerAccount(user);
  }

  @Post("login")
  login(
    @Body() user: User
  ): Observable<{ token: string }> {
    return this.authService.loginAccount(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
