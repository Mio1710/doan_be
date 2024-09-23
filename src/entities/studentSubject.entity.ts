import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { Student } from './student.entity';
import { Topic } from './topic.entity';
import { Semester } from './semester.entity';

@Entity('student_subject')
export class StudentSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column()
  subject_id: number;

  @Column({ type: 'enum', enum: ['topic', 'intern'] })
  subject_type: string;

  @Column({ type: 'enum', enum: ['new', 'finish', 'fail'], default: 'new' })
  subject_status: string;

  @Column({ nullable: true, default: null })
  group: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;
}
