import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post, Put,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { map, Observable, of, switchMap } from "rxjs";
import { join } from "path";
import { UserService } from "../services/user.service";
import { JwtGuard } from "../guards/jwt.guard";
import { isFileExtensionSafe, removeFile, saveImageToStorage } from "../utils/image-storage";
import { User, UserSafe } from "../models/user.class";
import { FriendRequest, FriendRequestStatus } from "../models/friend-request.interface";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Post("upload")
  @UseInterceptors(FileInterceptor("file", saveImageToStorage))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ): Observable<{ modifiedFileName: string } | { error: string }> {
    const fileName = file?.filename;

    if (!fileName) {
      return of({ error: "File must be a png, jpg/jpeg" });
    }

    const imagesFolderPath = join(process.cwd(), "images");
    const fullImagePath = join(`${imagesFolderPath}/${file.filename}`);

    return isFileExtensionSafe(fullImagePath).pipe(
      switchMap((isFileLegit: boolean) => {
        if (!isFileLegit) {
          removeFile(fullImagePath);
          return of({ error: "File content does not match extension!" });
        }

        return this.userService.updateUserImageById(req.user.id, fileName).pipe(
          map(() => ({ modifiedFileName: file.filename }))
        );
      })
    );
  }

  @UseGuards(JwtGuard)
  @Get("image")
  findImage(
    @Request() req,
    @Res() res
  ): Observable<Object> {
    return this.userService.findImageNameByUserId(req.user.id).pipe(
      switchMap((imageName: string) => {
        return of(res.sendFile(imageName, { root: "./images" }));
      })
    );
  }

  @UseGuards(JwtGuard)
  @Get("image-name")
  findUserImageName(
    @Request() req
  ): Observable<{ imageName: string }> {
    return this.userService.findImageNameByUserId(req.user.id).pipe(
      switchMap((imageName: string) => {
        return of({ imageName });
      })
    );
  }

  @UseGuards(JwtGuard)
  @Get(":userId")
  findUserById(
    @Param('userId', ParseIntPipe) userId: number
  ): Observable<UserSafe> {
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  sendFriendRequest(
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Request() req,
  ): Observable<FriendRequest | { error: string }> {
    return this.userService.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  getFriendRequestStatus(
    @Param('receiverId', ParseIntPipe) receiverId: number,
    @Request() req,
  ): Observable<{ status: FriendRequestStatus}> {
    return this.userService.getFriendRequestStatus(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put("friend-request/response/:friendRequestId")
  respondToFriendRequest(
    @Param("friendRequestId", ParseIntPipe) friendRequestId: number,
    @Body() statusResponse: { status: FriendRequestStatus }
  ): Observable<{ status: FriendRequestStatus }> {
    return this.userService.respondToFriendRequest(
      statusResponse.status,
      friendRequestId
    );
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/me/received-requests')
  getFriendRequestsFromRecipients(
    @Request() req,
  ): Observable<{ status: FriendRequestStatus }[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friends/my')
  getFriends(@Request() req): Observable<User[]> {
    return this.userService.getFriends(req.user);
  }
}
