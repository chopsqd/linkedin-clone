import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { catchError, from, map, Observable, of, switchMap, tap } from "rxjs";
import * as bcrypt from "bcrypt";
import { User, UserSafe } from "../models/user.class";
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

  private doesUserExist(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({ email })).pipe(
      map(user => !!user)
    );
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

    return this.doesUserExist(email).pipe(
      tap((doesUserExist: boolean) => {
        if (doesUserExist) {
          throw new HttpException(
            'A user has already been created with this email address',
            HttpStatus.BAD_REQUEST,
          );
        }
      }),
      switchMap(() => this.hashPassword(password)),
      switchMap((hashedPassword: string) =>
        from(
          this.userRepository.save({
            firstName,
            lastName,
            email,
            password: hashedPassword,
          }),
        ),
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

  getJwtUser(jwt: string): Observable<User | null> {
    return from(this.jwtService.verifyAsync(jwt)).pipe(
      map(({ user }: { user: User }) => user),
      catchError(() => of(null)),
    );
  }
}
