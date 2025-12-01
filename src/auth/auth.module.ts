import { Inject, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerService } from './mailer/mailer.service';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from 'src/utils/Strategies/jwt-access.strategy';
import { RefreshTokenStrategy } from 'src/utils/Strategies/jwt-refresh.strategy';

@Module({
  imports:[
    TypeOrmModule.forFeature([User]),
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(config:ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' }
      })
    }),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, MailerService, JwtAccessStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
