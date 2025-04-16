import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) { }

  ngOnInit() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
  }

 
  

}
