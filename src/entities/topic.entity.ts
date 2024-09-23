import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Semester } from './semester.entity';
import { Student } from './student.entity';
import { StudentSubject } from './studentSubject.entity';

@Entity('topic')
export class Topic extends BaseEntity {
  @Column({ length: 150, type: 'nvarchar' })
  ten: string;

  @Column({ length: 1000, type: 'nvarchar', nullable: true })
  description: string;

  @Column({ length: 1000, type: 'nvarchar', nullable: true })
  requirement: string;

  @Column({ length: 1000, type: 'nvarchar', nullable: true })
  knowledge: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(
    () => StudentSubject,
    (studentSubject) => studentSubject.subject_id,
  )
  studentSubject: StudentSubject[];
}
