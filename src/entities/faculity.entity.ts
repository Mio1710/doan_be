import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Faculity extends BaseEntity {
  @Column({ length: 10, type: 'char' })
  makhoa: string;

  @Column({ length: 155, type: 'varchar' })
  ten: string;
}
