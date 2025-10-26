import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePasswordHelper } from 'src/utils/helper';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(user: any){
    const payload = {sub: user.id, userName: user.name, email: user.email};
    return {
      access_token: this.jwtService.sign(payload),
    }

  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        isVerified: true,
      },
    });

    if(!user){
        throw new BadRequestException('Invalid email or password');
    }

    const isPasswordValid = await comparePasswordHelper(password, user.password);
    if(!isPasswordValid){
        throw new BadRequestException('Invalid email or password');
    }

    return user;
  }
}
