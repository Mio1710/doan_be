import { Entity, ManyToOne, JoinColumn, Column, Index } from 'typeorm';
import { Student } from './student.entity';
import { Topic } from './topic.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';

@Entity('student_topics')
@Index('IDX_student_semester', ['student_id', 'semester_id'], { unique: true })
export class StudentTopic extends BaseEntity {
  @Column({ name: 'student_id' })
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'topic_id', nullable: true })
  topic_id: number;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ type: 'enum', enum: ['new', 'finish', 'fail'], default: 'new' })
  status: string;

  @Column({ name: 'semester_id' })
  semester_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @ManyToOne(() => Group)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({ name: 'group_id', nullable: true })
  group_id: number;

  @Column({ default: 1 })
  khoa_id: number;
}
