import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Faculty } from './faculty.entity';
import { BaseEntity } from './base.entity';
import { StudentTopic } from './student-topic.entity';
import { StudentIntern } from './student-intern.entity';
import { Group } from './group.entity';
// import { Intern } from './intern.entity';

@Entity('student')
export class Student extends BaseEntity {
  @Column({ length: 10, type: 'char' })
  maso: string;

  @Column({ length: 50, type: 'varchar' })
  hodem: string;

  @Column({ length: 50, type: 'varchar' })
  ten: string;

  @Column({ length: 100, type: 'char', nullable: true })
  hinhanh?: string;

  @Column({ length: 50, type: 'char' })
  email: string;

  @Column({ length: 11, type: 'char', nullable: true })
  phone?: string;

  @Column({ length: 255, type: 'varchar' })
  matkhau: string;

  @Column({ length: 50, type: 'varchar' })
  lop: string;

  @Column({ name: 'khoa_id', nullable: true })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  facutily: Faculty;

  @OneToMany(() => StudentTopic, (studentTopic) => studentTopic.student, {
    onUpdate: 'NO ACTION',
  })
  studentTopic: StudentTopic[];

  @OneToMany(() => StudentIntern, (studentIntern) => studentIntern.student, {
    onUpdate: 'NO ACTION',
  })
  studentIntern: StudentIntern[];

  @ManyToOne(() => Group)
  group: Group;

  // @OneToOne(() => Intern)
  // intern: Intern;
}
