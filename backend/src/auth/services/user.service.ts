import { Injectable } from "@nestjs/common";
import { from, map, Observable } from "rxjs";
import { User, UserSafe } from "../models/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../models/user.entity";
import { Repository, UpdateResult } from "typeorm";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}

  findUserById(id: number): Observable<UserSafe> {
    return from(
      this.userRepository.findOne({ id }, { relations: ["feed_post"] })
    ).pipe(
      map(({password, ...userWithoutPassword}: User) => userWithoutPassword)
    );
  }

  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity()

    user.id = id
    user.imagePath = imagePath

    return from(
      this.userRepository.update(id, user)
    )
  }

  findImageNameByUserId(id: number): Observable<string> {
    return from(
      this.userRepository.findOne({ id })
    ).pipe(
      map(({ password, ...userWithoutPassword }: User) => userWithoutPassword.imagePath)
    )
  }
}
