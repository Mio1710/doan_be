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

  @Column({ type: 'timestamp' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_register_group: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_register_group: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_publish_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_publish_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_register_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_register_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_defense: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_defense: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_report_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  end_report_topic: Date;

  @Column({ type: 'timestamp', nullable: true })
  public_result: Date;
}
