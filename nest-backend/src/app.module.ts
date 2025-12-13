import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { TronListener } from './listeners/tron.listener';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: '127.0.0.1',
        port: Number(6379)
      },
    }),
    BullModule.registerQueue({
      name: 'deposit-events', // <- сюда должен совпадать токен в @InjectQueue
    }),
  ],
  controllers: [AppController],
  providers: [AppService, TronListener],
})
export class AppModule {}
