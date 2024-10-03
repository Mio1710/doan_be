import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Student } from './student.entity';
import { Topic } from './topic.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';

@Entity('student_topics')
export class StudentTopic extends BaseEntity {
  @Column({ name: 'student_id' })
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'topic_id' })
  topic_id: number;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ type: 'enum', enum: ['new', 'finish', 'fail'], default: 'new' })
  subject_status: string;

  // auto increment without primary generated
  @Column({ nullable: true })
  group: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;
}
