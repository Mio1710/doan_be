import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { StudentIntern } from './student-intern.entity';

@Entity('report_intern')
export class ReportIntern extends BaseEntity {
  @Column({ type: 'int', name: 'week' })
  week: number;

  @Column({ type: 'varchar', length: 255 })
  file_key: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string;

  @Column({ type: 'nvarchar', length: 1000 })
  description: string;

  @ManyToOne(
    () => StudentIntern,
    (studentIntern) => studentIntern.reportInterns,
  )
  @JoinColumn({ name: 'student_intern_id' })
  studentIntern: StudentIntern;

  @Column({ name: 'student_intern_id', nullable: false })
  student_intern_id: number;
}
