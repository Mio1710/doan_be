import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('semester')
export class Semester extends BaseEntity {
  @Column({ length: 150, unique: true, type: 'nvarchar' })
  ten: string;

  @Column({ default: 0 })
  status: boolean;

  @Column({ length: 150, type: 'nvarchar', nullable: true })
  note: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
