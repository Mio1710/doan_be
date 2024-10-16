import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentTopic } from './student-topic.entity';
import { Student } from './student.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @OneToOne(() => Student, (student) => student.group)
  @JoinColumn({ name: 'first_partner_id' })
  firstPartner?: StudentTopic;

  @OneToOne(() => Student, (student) => student.group)
  @JoinColumn({ name: 'second_partner_id' })
  secondPartner?: StudentTopic;
}
