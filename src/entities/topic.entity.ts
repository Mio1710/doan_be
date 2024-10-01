import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Semester } from './semester.entity';
import { StudentTopic } from './student-topic.entity';
import { Faculty } from './faculty.entity';
import { TopicSemester } from './topic-semester.entity';

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'khoa_id' })
  khoa_id: number;

  @ManyToOne(() => Faculty)
  @JoinColumn({ name: 'khoa_id' })
  khoa: Faculty;

  @OneToMany(() => TopicSemester, (topicSemester) => topicSemester.topic)
  semesters: TopicSemester[];

  @OneToMany(() => StudentTopic, (studentTopic) => studentTopic.topic_id)
  studentTopic: StudentTopic[];
}
