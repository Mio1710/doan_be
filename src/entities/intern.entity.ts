import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { StudentIntern } from './student-intern.entity';
import { User } from './user.entity';
import { Semester } from './semester.entity';
import { Faculty } from './faculty.entity';

@Entity('intern')
export class Intern {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  company_name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({ type: 'bigint', nullable: false })
  company_phone: number;

  @Column({ type: 'char', length: 50, nullable: false })
  company_email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  supervisor_name: string;

  @Column({ type: 'bigint', nullable: false })
  supervisor_phone: number;

  @Column({ type: 'char', length: 50, nullable: false })
  supervisor_email: string;

  @Column({ type: 'enum', enum: ['register', 'approved', 'rejected'], nullable: false })
  status: string;

  @Column({ type: 'float', precision: 10, nullable: true })
  score: number;

  @Column({ name: 'student_intern_id', nullable: true })
  student_intern_id: number;

  @OneToOne(() => StudentIntern)
  @JoinColumn({ name: 'student_intern_id' })
  student_intern: StudentIntern;

  @Column({ name: 'teacher_id', nullable: true })
  teacher_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'semester_id', nullable: true })
  semester_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ name: 'khoa_id', nullable: true })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Faculty;
}