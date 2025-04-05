import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { from, map, Observable, switchMap } from "rxjs";
import * as bcrypt from "bcrypt";
import { User, UserSafe } from "../models/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../models/user.entity";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  private hashPassword(password: string): Observable<string> {
    return from(bcrypt.hash(password, 10));
  }

  private validateUser(email: string, password: string): Observable<UserSafe> {
    return from(
      this.userRepository.findOne(
        { email },
        { select: ["id", "firstName", "lastName", "email", "password", "role"] }
      )
    ).pipe(
      switchMap((user: User | undefined) => {
        if (!user) {
          throw new HttpException(
            { status: HttpStatus.FORBIDDEN, error: "Invalid Credentials" },
            HttpStatus.FORBIDDEN
          );
        }

        return from(bcrypt.compare(password, user.password)).pipe(
          map((isValidPassword: boolean) => {
            if (!isValidPassword) {
              throw new HttpException(
                { status: HttpStatus.FORBIDDEN, error: "Invalid Password" },
                HttpStatus.FORBIDDEN
              );
            }

            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword as UserSafe;
          })
        );
      })
    );
  }

  registerAccount(user: User): Observable<UserSafe> {
    const { firstName, lastName, email, password } = user;

    return this.hashPassword(password).pipe(
      switchMap((hashedPassword: string) =>
        from(this.userRepository.save({ firstName, lastName, email, password: hashedPassword }))
      ),
      map(({ password, ...userWithoutPassword }: User) => userWithoutPassword)
    );
  }

  loginAccount(user: User): Observable<string> {
    const { email, password } = user;

    return this.validateUser(email, password).pipe(
      switchMap((userSafe: UserSafe) =>
        from(this.jwtService.signAsync({ user: userSafe }))
      )
    );
  }

  findUserById(id: number): Observable<UserSafe> {
    return from(
      this.userRepository.findOne({ id }, { relations: ["feed_post"] })
    ).pipe(
      map(({password, ...userWithoutPassword}: User) => userWithoutPassword)
    );
  }
}
