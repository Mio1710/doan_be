import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentTopic } from './student-topic.entity';

@Entity('report_topic')
export class ReportTopic extends BaseEntity {
  @Column({ type: 'int', name: 'week' })
  week: number;

  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  @Column({ type: 'nvarchar', length: 1000 })
  description: string;

  @ManyToOne(() => StudentTopic, (studentTopic) => studentTopic.reportTopics)
  @JoinColumn({ name: 'student_topic_id' })
  studentTopic: StudentTopic;

  @Column({ name: 'student_topic_id', nullable: false })
  student_topic_id: number;
}
