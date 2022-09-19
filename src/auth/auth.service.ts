import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { throwError } from "rxjs";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto/auth.dto";


@Injectable({})
export class AuthService {

    constructor(private prisma: PrismaService, private jwt: JwtService,
        private config: ConfigService ) {}

    async signup(dto: AuthDto) {

        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    password: dto.password
                }
            })
    
            console.log(dto)
            return this.signToken(user.id, user.email)
        } catch (error) {

            if (error instanceof PrismaClientKnownRequestError) {

            } 
            else throwError
            
        }

        
    }
    

    async signin(dto:AuthDto) {

        const user = await this.prisma.user.findFirst({
            where: {
                email:dto.email, 
            },
        });

        if (!user) throwError

        const user2 = await this.prisma.user.findFirst({
            where: {
                email:dto.password, 
            },
        });

        if (!user2) throwError



        return this.signToken(user.id, user.email)
    }

    async signToken(userId: number, email: string) {

        const secret = this.config.get('JWT_SECRET')

        const payload = {
            sub: userId,
            email
        }

        const token = await this.jwt.signAsync(payload, {
            expiresIn: '50m',
            secret: secret
        })

        return {
            access_token : token
        }

    }
}