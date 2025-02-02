import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { TransactionContext } from './context/transaction.context';

@Injectable()
export class TransactionService implements OnModuleDestroy {
  private queryRunner: QueryRunner;

  constructor(private readonly dataSource: DataSource) {}

  // Start transaction and return TransactionContext
  async startTransaction(): Promise<TransactionContext> {
    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.startTransaction();
    return new TransactionContext(this.queryRunner);
  }

  // Commit transaction
  async commitTransaction() {
    if (!this.queryRunner || this.queryRunner.isReleased) {
      throw new Error('No transaction is active');
    }
    await this.queryRunner.commitTransaction();
  }

  // Rollback transaction
  async rollbackTransaction() {
    if (!this.queryRunner) throw new Error('No transaction is active');
    await this.queryRunner.rollbackTransaction();
  }

  // Release the transaction
  async releaseTransaction() {
    if (this.queryRunner) {
      await this.queryRunner.release();
    }
  }

  // Clean up resources on module destroy
  onModuleDestroy() {
    this.releaseTransaction();
  }
}
