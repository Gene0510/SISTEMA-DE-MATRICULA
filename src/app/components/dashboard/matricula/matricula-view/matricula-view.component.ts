import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { NuevaAula } from '../../../../models/aula';
import { Estudiante } from '../../../../models/estudiante';
import { Horario } from '../../../../models/horario';
import { InformeModel } from '../../../../models/informe';
import { NuevaMateria } from '../../../../models/materia';
import { MatriculaView } from '../../../../models/matricula';
import { NuevoUsuario } from '../../../../models/nuevo-usuario';
import { AulaService } from '../../../../services/aula.service';
import { AuthService } from '../../../../services/auth.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { HorarioService } from '../../../../services/horario.service';
import { MateriaService } from '../../../../services/materia.service';
import { MatriculaService } from '../../../../services/matricula.service';

@Component({
  selector: 'app-matricula-view',
  templateUrl: './matricula-view.component.html',
  styleUrls: ['./matricula-view.component.css']
})
export class MatriculaViewComponent implements OnInit {

  matricula: MatriculaView = {
    fecha: '',
    fechaInicio: '',
    fechaFinal: '',
    alumno: {
      id_estudiante: 0,
      nombre_estudiante: '',
      cedula_estudiante: '',
      email_estudiante: '',
      edad_estudiante: 0,
      numero_estudiante: '',
      //se implento el campo representante 
      representante: {
        nombre_representante: '',
        cedula_representante: '',
        email_representante: '',
        numero_representante: '',
      },
      //se implento el campo direccion 
      direccion: {
        ciudad: '',
        sector: '',
        detalle: '',
      },
     //se implento el campo institucion 
      institucion: { 
        nombre: '',
        tipo: '',
        nivel: '',
        grado: '',
        jornada: '',
      },
    },
    profesor: {
      id_usuario: 0,
      nombres_usuario: '',
      cedula: '',
    },
    materia: {
      id_materia: 0,
      nombre: '',
      abreviatura: '',
    },
    programacion:{
      id_programacion: 0,
      horario: []
    },
  };

  horario: Horario = {
    id_horario: 0,
    dia: '',
    horaInicio: '',
    horaSalida: '',
    modalidad: '',
    aula: {
      id_aula: 0,
      nombreAula: '',
      capacidad: 0,
    }
  }

  usuarios: NuevoUsuario[] = [];
  estudiantes: Estudiante[] = [];
  materias: NuevaMateria[] = [];
  horarios: Horario[] = [];
  aulas: NuevaAula[] = [];

  listaVacia: string | undefined;

  @ViewChild('content') content!: ElementRef;
  info: InformeModel | null = null;

  constructor(
    private matriculaService: MatriculaService,
    private horarioService: HorarioService,
    private estudianteService: EstudianteService,
    private materiaService: MateriaService,
    private usuarioService: AuthService,
    private aulaService: AulaService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params["id_matricula"];
    this.matriculaService.detail(id).subscribe(
      (data: MatriculaView) => {
        this.matricula = data;
      },
      (err) => {
        this.toastr.error(err.error.message, 'Fail', {
          timeOut: 3000,
          positionClass: 'toast-top-center'
        });
        this.volver();
      }
    );
    this.cargarHorario();
    this.cargarUsuarios();
    this.cargarEstudiantes();
    this.cargarMaterias();
  }

  cargarHorario(): void {
    this.horarioService.lista().subscribe(
      (data: Horario[]) => {
        this.horarios = data;
        this.listaVacia = undefined;
      },
      (error: any) => {
        this.listaVacia = 'No tienes horarios';
      }
    );
  }

  cargarUsuarios(): void {
    this.usuarioService.lista().subscribe(
      (data: NuevoUsuario[]) => {
        this.usuarios = data;
        this.listaVacia = undefined;
      },
      (error: any) => {
        this.listaVacia = 'No tienes usuarios';
      }
    );
  }

  cargarEstudiantes(): void {
    this.estudianteService.getAllEstudiante().subscribe(
      (data: Estudiante[]) => {
        this.estudiantes = data;
        this.listaVacia = undefined;
      },
      (error: any) => {
        this.listaVacia = 'No tienes estudiantes';
      }
    );
  }

  cargarMaterias(): void {
    this.materiaService.lista().subscribe(
      (data: NuevaMateria[]) => {
        this.materias = data;
        this.listaVacia = undefined;
      },
      (error: any) => {
        this.listaVacia = 'No tienes materias';
      }
    );
  }

  volver(): void {
    this.router.navigate(['/dashboard/matricula']);
  }
  
  public downloadPDF1(): void {
    const estudiante = this.info?.estudiante;
    const DATA = this.content.nativeElement;
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres descargar el informe en formato PDF?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, descargar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        html2canvas(DATA).then(canvas => {
          const fileWidth = 190;
          const fileHeight = canvas.height * fileWidth / canvas.width;

          const FILEURI = canvas.toDataURL('image/png');
          const PDF = new jsPDF('p', 'mm', 'a4');
          const position = 10;
          const leftMargin = 10;
          PDF.addImage(FILEURI, 'PNG', leftMargin, position, fileWidth, fileHeight);

          PDF.save(`informe_${estudiante}.pdf`);
        }).catch(error => {
          console.error('Error al generar el PDF:', error);
        });
      }
    });
  }

  getAbreviaturas(): (string | null)[] {
    const abreviaturas = this.materias.map(materia => materia.abreviatura || null);
    const result: (string | null)[] = [];
    for (let i = 0; i < 4; i++) {
      result.push(abreviaturas[i]);
    }
    return result;
  }
}
