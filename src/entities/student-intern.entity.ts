import { 
  Entity, 
  ManyToOne, 
  OneToOne, 
  JoinColumn, 
  Column, 
  Index, 
  DeleteDateColumn, 
} from 'typeorm';
import { Student } from './student.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';
import { Intern } from './intern.entity';

@Entity('student_intern')
@Index('IDX_student_semester', ['student_id', 'semester_id', 'deleted_at'], { 
  unique: true, 
})
export class StudentIntern extends BaseEntity {
  @Column({ name: 'student_id' })
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'enum', enum: ['new', 'finish', 'fail'], default: 'new' })
  status: string;

  @Column({ name: 'semester_id' })
  semester_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ default: 1 })
  khoa_id: number;

  @Column({ name: 'intern_id', nullable: true })
  intern_id: number;

  @OneToOne(() => Intern)
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at: Date;

}