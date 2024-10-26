import { Entity, ManyToOne, JoinColumn, Column, Index } from 'typeorm';
import { Student } from './student.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';

@Entity('student_intern')
@Index('IDX_student_semester', ['student_id', 'semester_id'], { unique: true })
export class StudentIntern extends BaseEntity {
  @Column({ name: 'student_id' })
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'enum', enum: ['new', 'finish', 'fail'], default: 'new' })
  intern_status: string;

  @Column({ name: 'semester_id' })
  semester_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ default: 1 })
  khoa_id: number;
}