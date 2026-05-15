import { Controller, HttpCode, HttpStatus, Delete } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(private dataSource: DataSource) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllData(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  }
}
