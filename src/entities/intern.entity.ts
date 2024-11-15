// import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
// import { StudentIntern } from './student-intern.entity';
// import { User } from './user.entity';
// import { Semester } from './semester.entity';
// import { Faculty } from './faculty.entity';

// @Entity('intern')
// export class Intern {

//   @Column({ type: 'varchar', length: 255, nullable: false })
//   company_name: string;

//   @Column({ type: 'varchar', length: 255, nullable: false })
//   address: string;

//   @Column({ type: 'char', nullable: false })
//   company_phone: number;

//   @Column({ type: 'char', length: 50, nullable: false })
//   company_email: string;

//   @Column({ type: 'varchar', length: 100, nullable: false })
//   supervisor_name: string;

//   @Column({ type: 'char', nullable: false })
//   supervisor_phone: number;

//   @Column({ type: 'char', length: 50, nullable: false })
//   supervisor_email: string;

//   @Column({ type: 'enum', enum: ['register', 'approved', 'rejected'], default: 'register' })
//   status: string;

//   @Column({ type: 'float'})
//   score: number;

//   @Column({ name: 'student_intern_id'})
//   student_intern_id: number;

//   @OneToOne(() => StudentIntern, studentIntern => studentIntern.intern)
//   @JoinColumn({ name: 'student_intern_id' })
//   student_intern: StudentIntern;

//   // @Column({ name: 'teacher_id', nullable: true })
//   // teacher_id: number;

//   // @ManyToOne(() => User)
//   // @JoinColumn({ name: 'teacher_id' })
//   // teacher: User;

//   @Column({ name: 'semester_id', nullable: true })
//   semester_id: number;

//   @ManyToOne(() => Semester)
//   @JoinColumn({ name: 'semester_id' })
//   semester: Semester;

//   @Column({ name: 'khoa_id', nullable: true })
//   khoa_id: number;

//   @ManyToOne(() => Faculty)
//   @JoinColumn({ name: 'khoa_id' })
//   khoa: Faculty;
// }

import {
  Entity,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { StudentIntern } from './student-intern.entity';
import { Faculty } from './faculty.entity';
import { Student } from './student.entity';
// import { TopicSemester } from './topic-semester.entity';

@Entity('intern')
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

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @Column({ name: 'teacher_id' })
  teacher_id: number;

  @OneToOne(() => Student)
  @JoinColumn({ name: 'created_by' })
  createdBy: Student;

  // @OneToOne(() => StudentIntern)
  // @JoinColumn({ name: 'student_intern_id' })
  // student_intern: StudentIntern;
  @OneToOne(() => StudentIntern, (studentIntern) => studentIntern.intern_id)
  studentIntern: StudentIntern[];

  @Column({name: 'student_intern_id', nullable: true})
  student_intern_id: number;

  @Column({ name: 'khoa_id' })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Faculty;

  // @OneToMany(() => TopicSemester, (topicSemester) => topicSemester.topic)
  // semesters: TopicSemester[];

  // add soft delete
  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deletedAt: Date;
}
