import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Intern } from './intern.entity';
import { Semester } from './semester.entity';
import { BaseEntity } from './base.entity';

@Entity('intern_semester')
export class InternSemester extends BaseEntity {
  @ManyToOne(() => Intern)
  @JoinColumn({ name: 'intern_id' })
  intern: Intern;

  @Column({ name: 'intern_id' })
  intern_id: number;

  @ManyToOne(() => Semester)
  @JoinColumn({ name: 'semester_id' })
  semester: Semester;

  @Column({ name: 'semester_id' })
  semester_id: number;
}
