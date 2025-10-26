import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register-dto';
import { generateVerificationCode, getExpirationTime, hashPasswordHelper } from 'src/utils/helper';
import { EmailService } from 'src/email/email.service';
import { GetUsersDto } from './dto/get-users.dto';


@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly emailService: EmailService
    ){}

    async isEmailExists(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        })

        return !!user;
    }

    async register(registerDto: RegisterDto){
        const { email, name, password } = registerDto;
        const hashPassword = await hashPasswordHelper(password);
        const verificationCode = generateVerificationCode();
        const expirationTime = getExpirationTime();

        const isEmailExists = await this.isEmailExists(email);
        if(isEmailExists){
            throw new BadRequestException('Email already exists');
        }

        const user = await this.prisma.user.create({
            data:{
                email,
                name,
                password: hashPassword,
                codeID: verificationCode,
                codeExpired: expirationTime,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        })
        if(user){
            await this.emailService.sendVerificationEmail(name, email, verificationCode);
        }

        return {
            message: 'User created successfully',
            data: user,
        }

    }

    async verifyEmail(codeID: number){
        const user = await this.prisma.user.findFirst({
            where:{
                codeID: codeID,
                codeExpired:{
                    gt: new Date()
                }
            }
        })

        if(!user){
            throw new BadRequestException('Invalid verification code');
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data:{
                isVerified: true,
            }
        })

        return{
            message: 'Email verified successfully',
        }

    }

    async getUsers(getUsersDto: GetUsersDto) {
        const { search, current = 1, pageSize = 10 } = getUsersDto;

        const skip = (current - 1) * pageSize;

        const whereCondition = search
            ? {
                OR: [
                    {
                        name: {
                            contains: search,
                        },
                    },
                    {
                        email: {
                            contains: search,
                        },
                    },
                ],
            }
            : {};

        const total = await this.prisma.user.count({
            where: whereCondition,
        });

        const result = await this.prisma.user.findMany({
            where: whereCondition,
            skip,
            take: pageSize,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        const page = Math.ceil(total / pageSize);

        return {
            message: 'Users fetched successfully',
            meta: {
                current,
                pageSize,
                total,
                page,
            },
            data: result,
        };
    }

    async verifyUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isVerified) {
            throw new BadRequestException('User is already verified');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return {
            message: 'User verified successfully',
            data: updatedUser,
        };
    }
}
