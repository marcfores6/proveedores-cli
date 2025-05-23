import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EntornoService } from '../../service/entorno.service';

@Component({
  selector: 'app-shared.home.routed',
  templateUrl: './shared.home.routed.component.html',
  styleUrls: ['./shared.home.routed.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ]

})
export class SharedHomeRoutedComponent implements OnInit {

  isLoggedIn: boolean = false; 
  isDev: boolean = false;
  logoUrl: string = 'assets/img/supermercados-family-cash.png';
  nombreEmpresa: string = 'Family Cash';


  constructor(private router: Router, private entornoService: EntornoService) { }

   ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    this.setEntorno(this.entornoService.getEntorno());
    this.entornoService.getEntorno$().subscribe({
      next: (entorno) => this.setEntorno(entorno)
    });
  }

  private setEntorno(entorno: 'dev' | 'prod') {
  this.isDev = entorno === 'dev';

  if (this.isDev) {
    this.logoUrl = 'assets/img/cash&carry.png';
    this.nombreEmpresa = 'Cash&Carry';
  } else {
    this.logoUrl = 'assets/img/supermercados-family-cash.png';
    this.nombreEmpresa = 'Family Cash';
  }
}

}
