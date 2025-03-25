import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: 'app-shared-header-unrouted',
  templateUrl: './shared.header.unrouted.component.html',
  styleUrls: ['./shared.header.unrouted.component.css'],
  standalone: true
})

export class SharedHeaderUnroutedComponent implements OnInit {

  @Input() strTitulo: string = '';
  @Input() strIcono1: string = '';
  @Input() strIcono2: string = '';


  constructor() { }

  ngOnInit(): void { }


}
