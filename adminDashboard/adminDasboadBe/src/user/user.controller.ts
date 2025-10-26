import { Body, Controller, Post, Get, Query, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register-dto';
import { GetUsersDto } from './dto/get-users.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto){
    return this.userService.register(registerDto);
  }

  @Post('verify-email')
  verifyEmail(@Body() codeID: number){
    return this.userService.verifyEmail(codeID);
  }

  @Get('')
  getUsers(@Query() getUsersDto: GetUsersDto){
    return this.userService.getUsers(getUsersDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId/verify')
  verifyUser(@Param('userId', ParseIntPipe) userId: number){
    return this.userService.verifyUser(userId);
  }
}
