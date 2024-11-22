import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Faculty } from './faculty.entity';
import { BaseEntity } from './base.entity';
import { TeacherGroupMember } from './teacher_group_member.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ length: 10, type: 'char' })
  maso: string;

  @Column({ length: 50, type: 'varchar' })
  hodem: string;

  @Column({ length: 50, type: 'varchar' })
  ten: string;

  @Column({ length: 50, type: 'char', nullable: true })
  hinhanh?: string;

  @Column({ length: 50, type: 'char' })
  email: string;

  @Column({ length: 11, type: 'char', nullable: true })
  phone: string;

  @Column({ type: 'date', nullable: true })
  ngay_sinh: Date;

  @Column({ length: 255, type: 'varchar' })
  matkhau: string;

  @Column({ type: 'json' })
  roles: string[];

  @Column({ name: 'khoa_id', nullable: true })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  faculty?: Faculty;

  is_super_teacher?: number;
  is_admin?: number;

  @OneToMany(
    () => TeacherGroupMember,
    (teacherGroupMember) => teacherGroupMember.teacher,
  )
  teacher_group_members: TeacherGroupMember[];

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at: Date;
}
