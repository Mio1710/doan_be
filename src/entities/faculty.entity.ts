import { Entity, Column, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Faculty extends BaseEntity {
  @Column({ length: 10, type: 'char', nullable: true })
  ma_khoa: string;

  @Column({ length: 155, type: 'varchar' })
  ten: string;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
