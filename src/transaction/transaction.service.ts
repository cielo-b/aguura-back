import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Repository, EntityManager, Connection, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransactionService implements OnModuleDestroy {
  private queryRunner: QueryRunner;

  constructor(private readonly connection: Connection) {}

  // Start a transaction with a dynamic query runner
  async startTransaction() {
    this.queryRunner = this.connection.createQueryRunner();
    await this.queryRunner.startTransaction();
  }

  // Commit the transaction
  async commitTransaction() {
    if (!this.queryRunner) {
      throw new Error('No transaction is active');
    }
    await this.queryRunner.commitTransaction();
  }

  // Rollback the transaction
  async rollbackTransaction() {
    if (!this.queryRunner) {
      throw new Error('No transaction is active');
    }
    await this.queryRunner.rollbackTransaction();
  }

  // Release the query runner
  async releaseTransaction() {
    if (this.queryRunner) {
      await this.queryRunner.release();
    }
  }

  // Get query runner for a specific repository
  getRepository<T>(repository: Repository<T>): Repository<T> {
    if (!this.queryRunner) {
      throw new Error('No transaction is active');
    }
    return this.queryRunner.manager.getRepository(repository.target);
  }

  // On module destroy, ensure resources are cleaned up
  onModuleDestroy() {
    this.releaseTransaction();
  }
}
