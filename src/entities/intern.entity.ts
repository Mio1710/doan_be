import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { StudentIntern } from './student-intern.entity';
import { Faculty } from './faculty.entity';
import { Student } from './student.entity';
import { InternSemester } from './intern-semester.entity';

@Entity('intern')
// @Index('IDX_student_semester', ['student_intern_id', 'semester_id'], { unique: true })
export class Intern extends BaseEntity {
  @Column({ length: 250, type: 'nvarchar' })
  company_name: string;

  @Column({ length: 11, type: 'char', nullable: true })
  company_phone: string;

  @Column({ length: 1000, type: 'nvarchar', nullable: true })
  address: string;

  @Column({ length: 50, type: 'char', nullable: true })
  company_email: string;

  @Column({ length: 1000, type: 'nvarchar', nullable: true })
  supervisor_name: string;

  @Column({ length: 11, type: 'char', nullable: true })
  supervisor_phone: string;

  @Column({ length: 50, type: 'char', nullable: true })
  supervisor_email: string;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'teacher_id', nullable: true })
  teacher_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_intern_id'})
  student: Student;

  @Column({ name: 'student_intern_id'})
  student_intern_id: number;

  @Column({ name: 'khoa_id' })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Faculty;

  @OneToOne(() => StudentIntern, (studentIntern) => studentIntern.intern_id)
  studentInterns: StudentIntern[];

  @OneToMany(() => InternSemester, (internSemester) => internSemester.intern)
  semesters: InternSemester[];

  // add soft delete
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
