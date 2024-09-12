import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Faculity } from './faculity.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ length: 10, unique: true, type: 'char' })
  maso: string;

  @Column({ length: 50, type: 'varchar' })
  hodem: string;

  @Column({ length: 50, type: 'varchar' })
  ten: string;

  @Column({ length: 50, type: 'char', nullable: true })
  hinhanh?: string;

  @Column({ length: 50, type: 'char' })
  email: string;

  @Column({ length: 11, type: 'char' })
  phone: string;

  @Column({ length: 255, type: 'varchar' })
  matkhau: string;

  @Column({ type: 'json' })
  types: string[];

  @ManyToOne(() => Faculity)
  @JoinColumn({ name: 'khoa_id' })
  facutily?: Faculity;
}
