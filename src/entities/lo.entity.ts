import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Faculty } from './faculty.entity';

@Entity('los')
export class LO extends BaseEntity {
  @Column({ length: 1000, type: 'nvarchar' })
  main_criteria: string;

  @Column({ length: 1000, type: 'nvarchar' })
  sub_criteria: string;

  @Column({ type: 'float' })
  cof: number;

  @Column({ default: 1 })
  allow_update: boolean;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  faculty: Faculty;

  @Column({ name: 'khoa_id', nullable: true })
  khoa_id: number;
}
