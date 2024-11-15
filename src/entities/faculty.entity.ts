import { Entity, Column, DeleteDateColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class Faculty extends BaseEntity {
  @Column({ length: 10, type: 'char', nullable: true })
  ma_khoa: string;

  @Column({ length: 155, type: 'varchar' })
  ten: string;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at: Date;

  @OneToMany(() => User, (user) => user.faculty)
  teachers: User[];
}
