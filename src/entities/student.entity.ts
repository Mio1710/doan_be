import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Faculty } from './faculty.entity';
import { BaseEntity } from './base.entity';
import { StudentSubject } from './studentSubject.entity';
import { Topic } from './topic.entity';

@Entity('student')
export class Student extends BaseEntity {
  @Column({ length: 10, unique: true, type: 'char' })
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
  phone?: string;

  @Column({ length: 255, type: 'varchar' })
  matkhau: string;

  @Column({ length: 50, type: 'varchar' })
  lop: string;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  facutily: Faculty;

  @OneToMany(() => StudentSubject, (studentSubject) => studentSubject.student)
  studentSubject: StudentSubject[];

  @ManyToOne(() => Topic)
  topic: Topic;
}
