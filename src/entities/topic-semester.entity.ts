import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Topic } from './topic.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';

@Entity('topic_semester')
export class TopicSemester extends BaseEntity {
  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ name: 'topic_id' })
  topic_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ name: 'semester_id' })
  semester_id: number;
}
