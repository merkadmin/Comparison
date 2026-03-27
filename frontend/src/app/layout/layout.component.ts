import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      document.body.classList.add('no-sidebar');
    }
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-sidebar');
  }
}
