import {
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProgramacionEntity } from './programacion.entity';
import { EstudianteEntity } from 'src/estudiante/entities/estudiante.entity';
import { MateriaEntity } from './materia.entity';
import { UsuarioEntity } from 'src/usuario/entities/usuario.entity';

@Entity('matricula', { schema: 'sistema' })
export class MatriculaEntity {
  @PrimaryGeneratedColumn('increment')
  id_matricula: number;

  @Column('date')
  fecha: Date;

  @Column('date')
  fechaInicio: Date;

  @Column('date')
  fechaFinal: Date;

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

  //foreing keys
  @ManyToOne(() => EstudianteEntity, (estudiante) => estudiante.matricula, {
    eager: true,
  })
  @JoinColumn({ name: 'alumno' })
  alumno: EstudianteEntity;

  
  @ManyToOne(() => UsuarioEntity, (profesor) => profesor.matricula, {
    eager: true,
  })
  @JoinColumn({ name: 'profesor' })
  profesor: UsuarioEntity;

  @ManyToOne(() => MateriaEntity, (materia) => materia.matricula, {
    eager: true,
  })
  @JoinColumn({name: 'materia'})
  materia: MateriaEntity;

  @OneToOne(
    () => ProgramacionEntity,
    (programacion) => programacion.matricula,
    {
      eager: true,
      cascade: true,
    },
  )
  @JoinColumn({ name: 'programacion_id' })
  programacion: ProgramacionEntity;
}
