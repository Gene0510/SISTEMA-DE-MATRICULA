import {
  PrimaryGeneratedColumn,  
  Entity,
  ManyToMany,
  JoinTable,
  OneToOne,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HorarioEntity } from './horario.entity';
import { MatriculaEntity } from './matricula.entity';

@Entity('programacion', {schema: 'sistema' })
export class ProgramacionEntity {

  @PrimaryGeneratedColumn('increment')
  id_programacion: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'true=activo, false=inactivo',
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de creacion de la carrera',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'Fecha de actualizacion de la carrera',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
    comment: 'Fecha de eliminacion de la carrera',
  })
  deletedAt: Date;

  @ManyToMany(() => HorarioEntity, (horario) => horario.programacion,{
    eager: true,
  })
  @JoinTable({
    name: 'programacion_horario',
    joinColumn: { name: 'programacion_id' },
    inverseJoinColumn: { name: 'horario_id' },
  })
  horario: HorarioEntity[]; 

  @OneToOne(() => MatriculaEntity, matricula => matricula.programacion)
  matricula: MatriculaEntity;
}
