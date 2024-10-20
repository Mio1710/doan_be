import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentTopic } from './student-topic.entity';
import { LO } from './lo.entity';

@Entity('lo_student_topics')
@Unique('student_topic_lo', ['student_topic', 'lo'])
export class LOStudentTopic extends BaseEntity {
  @ManyToOne(() => StudentTopic)
  @JoinColumn({ name: 'student_topic_id' })
  student_topic: StudentTopic;

  @ManyToOne(() => LO)
  @JoinColumn({ name: 'lo_id' })
  lo: LO;

  @Column({ type: 'float' })
  score: number;
}
