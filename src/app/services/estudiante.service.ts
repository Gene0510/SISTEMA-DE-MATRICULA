import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Estudiante, ViewEstudiantes } from '../models/estudiante';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  base = environment.URL;
  estudianteURL = `${this.base}estudiante/`;

  constructor(private httpClient: HttpClient) {}

  createEstudiante(estudiante: Estudiante): Observable<any> {
    return this.httpClient.post<any>(`${this.estudianteURL}`, estudiante);
  }

  getAllEstudiante(): Observable<Estudiante[]> {
    return this.httpClient.get<Estudiante[]>(`${this.estudianteURL}`);
  }

  getEstudianteDetail(id_estudiante: number): Observable<ViewEstudiantes> {
    return this.httpClient.get<ViewEstudiantes>(`${this.estudianteURL}${id_estudiante}`);
  }

  updateEstudiante(id_estudiante: number, estudiante: Estudiante): Observable<any> {
    return this.httpClient.patch<any>(`${this.estudianteURL}${id_estudiante}`, estudiante);
  }

  deleteEstudiante(id_estudiante: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.estudianteURL}${id_estudiante}`);
  }
}
