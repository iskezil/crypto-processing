import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {TronWeb} from 'tronweb';

@Injectable()
export class TronListener implements OnModuleInit {
    private readonly logger = new Logger(TronListener.name);

    // Один экземпляр TronWeb для всего класса
    private tronWeb: TronWeb;
    private usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    private usdtContract: any;


    constructor() {
        this.tronWeb = new TronWeb({
            headers: { 'TRON-PRO-API-KEY': 'f922a8af-cea9-4eb9-bfde-f9cff67e0edc' },
            fullHost: 'https://api.trongrid.io',
        });
    }

    async onModuleInit() {
        const address = 'TCu8kcZRdxQr4YSvmkJqdro7LiGAuuaEoj'; // адрес для проверки

        // Инициализируем контракт один раз
        this.usdtContract = await this.tronWeb.contract().at(this.usdtContractAddress);

        // Запускаем цикл стресс-теста
        await this.runStressTest(address, 1000); // 100 итераций
    }

    async getBalances(address: string) {
        try {
            const balanceSun = await this.tronWeb.trx.getBalance(address);
            const balanceTRX = balanceSun / 1_000_000;

            const balanceUSDT = await this.getBalanceToken(address);

            this.logger.log(`[Balances] ${address} | TRX: ${balanceTRX} | USDT: ${balanceUSDT}`);
        } catch (err) {
            this.logger.error('Error fetching balances from TronGrid', err);
        }
    }

    async getBalanceToken(address: string) {
        try {
            const balanceRaw = await (this.usdtContract.methods.balanceOf as any)(address).call({ from: address });
            return Number(balanceRaw) / 1e6;
        } catch (err) {
            this.logger.error('Error fetching USDT balance', err);
            return 0;
        }
    }

    // Циклический стресс-тест
    async runStressTest(address: string, totalRequests: number, threads: number = 1) {
        this.logger.log(
          `Starting stress test: ${totalRequests} requests in ${threads} threads`
        );

        const startTime = Date.now();

        const perThread = Math.ceil(totalRequests / threads);

        const threadTasks: Promise<void>[] = [];

        for (let t = 0; t < threads; t++) {
            threadTasks.push(this.runWorkerThread(address, perThread, t + 1));
        }

        await Promise.all(threadTasks);

        const endTime = Date.now();
        const durationSec = ((endTime - startTime) / 1000).toFixed(2);

        this.logger.log(
          `Stress test completed in ${durationSec} seconds for ${totalRequests} requests using ${threads} threads`
        );
    }

    async runWorkerThread(address: string, iterations: number, threadId: number) {
        this.logger.log(`Thread #${threadId} started (${iterations} iterations)`);

        for (let i = 0; i < iterations; i++) {
            await this.getBalances(address);
        }

        this.logger.log(`Thread #${threadId} finished`);
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
