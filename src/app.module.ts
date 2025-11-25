import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from './auth/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath:'.env'
    }),
    TypeOrmModule.forRootAsync({
     imports:[ConfigModule],
     inject:[ConfigService],
     useFactory:(config:ConfigService) => ({
       type:'postgres',
       host:config.get<string>('DB_HOST'),
       port:config.get<number>('DB_PORT'),
       database:config.get<string>('DB_NAME'),
       username:config.get<string>('DB_USERNAME'),
       password:config.get<string>('DB_PASSWORD'),
       entities:[User],
       synchronize:true
     })
    }),
    PassportModule.register({defaultStrategy:'jwt'}),
    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory:(config:ConfigService) => ({
        secret:config.get<string>('JWT_SECRET'),
        signOptions:{ expiresIn:'2h' }
      })
    }),
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
