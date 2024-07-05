import { UsuarioEntity } from 'src/usuario/entities/usuario.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MatriculaEntity } from './matricula.entity';

@Entity('materia', {schema: 'sistema' })
export class MateriaEntity {
  @PrimaryGeneratedColumn('increment')
  id_materia: number;

  @ManyToMany(() => UsuarioEntity, (profesor) => profesor.materia)
  profesor: UsuarioEntity[];

  @Column('varchar', { length: 50, nullable: false, unique: true })
  nombre: string;

  @Column('varchar', { length: 50, nullable: true, unique: true })
  abreviatura: string;

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

  @OneToMany(() => MatriculaEntity, (matricula) => matricula.materia)
  matricula: MatriculaEntity[];
}
