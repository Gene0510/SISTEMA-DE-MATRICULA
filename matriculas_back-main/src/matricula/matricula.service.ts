import {   
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { UpdateMatriculaDto } from './dto/update-matricula.dto';
import { MatriculaEntity } from './entities/matricula.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HorarioEntity } from './entities/horario.entity';
import { MateriaEntity } from './entities/materia.entity';
import { ProgramacionEntity } from './entities/programacion.entity';
import { MessageDto } from 'src/common/message.dto';
import { EstudianteEntity } from 'src/estudiante/entities/estudiante.entity';
import { UsuarioEntity } from 'src/usuario/entities/usuario.entity';
import { AulaEntity } from './entities/aula.entity';

@Injectable()
export class MatriculaService {
  constructor(
    @InjectRepository(MatriculaEntity)
    private readonly matriculaRepository: Repository<MatriculaEntity>,
    @InjectRepository(ProgramacionEntity)
    private readonly programacionRepository: Repository<ProgramacionEntity>,
    @InjectRepository(HorarioEntity)
    private readonly horarioRepository: Repository<HorarioEntity>,  
    @InjectRepository(MateriaEntity)
    private readonly materiaRepository: Repository<MateriaEntity>,
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(AulaEntity)
    private readonly aulaRepository: Repository<AulaEntity>,
  ) {}


  async create(dto: CreateMatriculaDto): Promise<MatriculaEntity> {
    const {
      id_estudiante,
      id_usuario, //iria a la programacion de la matricula
      id_materia,
      programacion,
      ...matriculaData
    } = dto;
    
    const { horario_id, ...programacionData } = programacion;

    // Obtener entidades relacionadas
    const alumno = await this.estudianteRepository.findOne({
      where: { id_estudiante },
    });
    const profesor = await this.usuarioRepository.findOne({
      where: { id_usuario },
    }); //iria a la programacion de la matricula
    const materia = await this.materiaRepository.findOne({
      where: { id_materia },
    });
    const horarios = await this.horarioRepository.findByIds(horario_id); //iria a la programacion de la matricula   

    switch (true) {
      case !alumno:
        throw new NotFoundException(
          'No existe el alumno con ',
        );

      case !profesor:
        throw new NotFoundException(
          'No existe el profesor',
        );

      case !materia:
        throw new NotFoundException(
          'No existe la materia',
        );

      case !horarios:
        throw new NotFoundException(
          'No existen horarios',
        ); //iria a la programacion de la matricula     
      default:  
    } 

    // Crear instancia de ProgramacionEntity
    const nuevaProgramacion = this.programacionRepository.create({
      ...programacionData,
      horario: horarios,      
    }); //iria a la programacion de la matricula
    // Guardar la programación
    const savedProgramacion =
      await this.programacionRepository.save(nuevaProgramacion); //iria a la programacion de la matricula

    // Crear instancia de MatriculaEntity
    const matricula = this.matriculaRepository.create({
      ...matriculaData,
      alumno,
      profesor, //iria a la programacion de la matricula profesor one to many programacion 
      materia, // muchas materias que se matricula
      programacion: savedProgramacion, // esto sale se va a programacion
    });
 
    const savedMatricula = await this.matriculaRepository.save(matricula);      

    return savedMatricula;
  }
 
  
//   private async validarDisponibilidadProfesor(
//     horario_id: number[],
//     id_usuario: number
// ): Promise<void> {
//     for (const horarioId of horario_id) {
//         // Obtener todas las matrículas para el profesor en el horario dado
//         const numMatriculas = await this.matriculaRepository.count({
//             where: {
//                 profesor: { id_usuario },
//                 programacion: { horario: { id_horario: horarioId } }
//             }
//         });

//         // Verificar si ya hay dos estudiantes matriculados en este horario para el profesor
//         if (numMatriculas >= 2) {
//             throw new BadRequestException('El profesor no tiene disponibilidad en este horario.');
//         }
//     }
// }

async getMatriculasByUsuario(id_usuario: number): Promise<MatriculaEntity[]> {
  const matriculas = await this.matriculaRepository.find({
    where: { profesor: { id_usuario } },
    relations: ['alumno', 'materia', 'programacion', 'programacion.horario'],
  });

  if (!matriculas.length) {
    throw new NotFoundException(`No hay matrículas para el usuario con ID ${id_usuario}`);
  }

  // Cargar las aulas de los horarios
  for (const matricula of matriculas) {
    for (const horario of matricula.programacion.horario) {
      if (horario.modalidad === 'presencial') {
        const horarioConAula = await this.horarioRepository.findOne({
          where: { id_horario: horario.id_horario },
          relations: ['aula'],
        });
        horario.aula = horarioConAula.aula;
      }
    }
  }

  return matriculas;
}


async getHorariosByMatricula(idMatricula: number): Promise<HorarioEntity[]> {
  const matricula = await this.matriculaRepository.findOne({
    where: { id_matricula: idMatricula },
    relations: ['programacion', 'programacion.horario'],
  });

  if (!matricula) {
    throw new NotFoundException(`No existe la matrícula con ID ${idMatricula}`);
  }

  return matricula.programacion.horario;
}

  async findAll() {
    const matricula = await this.matriculaRepository.find();
    if (!matricula.length)
      throw new NotFoundException(
        new MessageDto('no hay matriculas en la lista'),
      );
      matricula.sort((a, b) => b.id_matricula - a.id_matricula);
    return matricula;
  }



  async findOne(id_matricula: number) {
    const matricula = await this.matriculaRepository.findOne({
      where: { id_matricula: id_matricula },
      relations: ['alumno', 'profesor', 'materia', 'programacion', 'programacion.horario'],
    });
    if (!matricula) {
      throw new NotFoundException(new MessageDto('No existe la matricula'));
    }
  
    // Cargar las aulas de los horarios
    for (const horario of matricula.programacion.horario) {
      if (horario.modalidad === 'presencial') {
        const horarioConAula = await this.horarioRepository.findOne({
          where: { id_horario: horario.id_horario },
          relations: ['aula'],
        });
        horario.aula = horarioConAula.aula;
      }
    }
  
    return matricula;
  }
  
  // lo mismo del create se va a programacion
  async update(id_matricula: number, dto: UpdateMatriculaDto) {
    const {
      id_estudiante,
      id_usuario,
      id_materia,
      programacion,
      ...matriculaData
    } = dto;

    return this.matriculaRepository.manager.transaction(async (manager) => {
      // Obtener la matrícula a actualizar
      const matricula = await manager.findOne(MatriculaEntity, {
        where: { id_matricula },
        relations: ['programacion', 'profesor', 'alumno', 'materia'],
      });

      if (!matricula) {
        throw new NotFoundException('No se encontró la matrícula');
      }

      // Obtener entidades relacionadas
      const alumno = await manager.findOne(EstudianteEntity, {
        where: { id_estudiante },
      });
      const profesor = await manager.findOne(UsuarioEntity, {
        where: { id_usuario },
      });
      const materia = await manager.findOne(MateriaEntity, {
        where: { id_materia },
      }); 

      // Actualizar programación si existe
      if (programacion) {
        // Obtener horarios y aulas
        const horarios = await manager.findByIds(
          HorarioEntity,
          programacion.horario_id,
        ); 

        // Actualizar horarios y aulas en la relación ManyToMany
        matricula.programacion.horario = horarios;       

        // Guardar los cambios en la entidad de Programacion
        await manager.save(matricula.programacion);
      }

      // Actualizar datos de la matrícula
      matricula.alumno = alumno;
      matricula.profesor = profesor; 
      matricula.materia = materia;

      // Aplicar otros datos de la matrícula
      Object.assign(matricula, matriculaData);

      // Guardar los cambios en la entidad de Matricula
      const updatedMatricula = await manager.save(matricula);

      return updatedMatricula;
    });
  }

  // hay que editar igual por que progrmacion sale de aqui
  async remove(id_matricula: number): Promise<string> {
    return await this.matriculaRepository.manager.transaction(
      async (manager) => {
        const matricula = await manager.findOne(MatriculaEntity, {
          where: { id_matricula },
          relations: [
            'programacion',            
            'programacion.horario',
          ],
        });

        if (!matricula) {
          throw new NotFoundException(
            `Matrícula con ID ${id_matricula} no encontrada`,
          );
        }      

        if (matricula.programacion) {
          // Eliminar programacion_horario y programacion_aulas
          await manager
            .createQueryBuilder()
            .delete()
            .from('programacion_horario')
            .where('programacion_id = :id', {
              id: matricula.programacion.id_programacion,
            })
            .execute();         

          // eliminar las matrículas relacionadas con la programación
          await manager.softRemove(MatriculaEntity, {
            programacion: {
              id_programacion: matricula.programacion.id_programacion,
            },
          });

          // Ahora es seguro eliminar la programación
          await manager.softRemove(ProgramacionEntity, matricula.programacion);
        }

        // Eliminar la matricula
        await manager.softRemove(MatriculaEntity, matricula);

        return ` Matrícula con ID ${id_matricula} y relaciones asociadas eliminadas correctamente`;
      },
    );
  }
}
