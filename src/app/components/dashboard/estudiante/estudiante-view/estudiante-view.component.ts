import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ViewEstudiantes } from '../../../../models/estudiante';
import { EstudianteService } from '../../../../services/estudiante.service';

@Component({
  selector: 'app-estudiante-view',
  templateUrl: './estudiante-view.component.html',
  styleUrls: ['./estudiante-view.component.css']
})
export class EstudianteViewComponent implements OnInit {

  estudiante: ViewEstudiantes = new ViewEstudiantes();

  constructor(
    private estudianteService: EstudianteService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params['id_estudiante'];
    this.estudianteService.getEstudianteDetail(id).subscribe(
      (data: ViewEstudiantes) => {
        this.estudiante = data;
      },
      (err) => {
        this.toastr.error(err.error.message, 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-center'
        });
        this.volver();
      }
    );
  }

  volver(): void {
    this.router.navigate(['/dashboard/estudiante']);
  }
}
