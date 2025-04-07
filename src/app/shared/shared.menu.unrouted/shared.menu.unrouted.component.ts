import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SessionService } from '../../service/session.service';

@Component({
  selector: 'app-shared-menu-unrouted',
  templateUrl: './shared.menu.unrouted.component.html',
  styleUrls: ['./shared.menu.unrouted.component.css']
})
export class SharedMenuUnroutedComponent implements OnInit {

  strRuta: string = '';
  activeSession: boolean = false;
  userNif: string = '';

  constructor(
    private oRouter: Router,
    private oSessionService: SessionService
  ) {
    this.oRouter.events.subscribe((oEvent) => {
      if (oEvent instanceof NavigationEnd) {
        this.strRuta = oEvent.url;
      }
    });
    this.activeSession = this.oSessionService.isSessionActive();
    if (this.activeSession) {
      this.userNif = this.oSessionService.getSessionNif();
    }
  }

  ngOnInit() {
    this.oSessionService.onLogin().subscribe({
      next: () => {        
        this.activeSession = true;
        this.userNif = this.oSessionService.getSessionNif();
      },
    });
    this.oSessionService.onLogout().subscribe({
      next: () => {
        this.activeSession = false;
        this.userNif = '';
      },
    });

  }

}
