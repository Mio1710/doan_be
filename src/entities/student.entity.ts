import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Faculity } from './faculity.entity';
import { BaseEntity } from './base.entity';

@Entity('student')
export class Student extends BaseEntity {
  @Column({ length: 10, unique: true, type: 'char' })
  maso: string;

  @Column({ length: 50, type: 'varchar' })
  hodem: string;

  @Column({ length: 50, type: 'varchar' })
  ten: string;

  @Column({ length: 50, type: 'char' })
  hinhanh: string;

  @Column({ length: 50, type: 'char' })
  email: string;

  @Column({ length: 11, type: 'char' })
  phone: string;

  @Column({ length: 255, type: 'varchar' })
  matkhau: string;

  @ManyToOne(() => Faculity)
  @JoinColumn({ name: 'khoa_id' })
  facutily: Faculity;
}
