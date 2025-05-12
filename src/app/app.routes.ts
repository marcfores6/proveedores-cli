import { Routes } from '@angular/router';
import { SharedHomeRoutedComponent } from './shared/shared.home.routed/shared.home.routed.component';
import { ProductoAdminEditRoutedComponent } from './component/producto/producto.admin.edit.routed/producto.admin.edit.routed.component';
import { SharedLoginRoutedComponent } from './shared/shared.login.routed/shared.login.routed';
import { SharedLogoutRoutedComponent } from './shared/shared.logout.routed/shared.logout.routed';
import { ProductoAdminPlistRoutedComponent } from './component/producto/producto.admin.plist.routed/producto.admin.plist.routed.component';
import { ProductoAdminXProveedorPlistRoutedComponent } from './component/producto/producto.admin.xproveedor.plist.routed/producto.admin.xproveedor.plist.routed.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminOrProveedorGuard } from './guards/admin-or-proveedor.guard';
import { SharedBynifRoutedComponent } from './shared/shared.bynif.routed/shared.bynif.routed.component';
import { ProductoAdminViewRoutedComponent } from './component/producto/producto.admin.view.routed/producto.admin.view.routed.component';
import { SharedRecuperarContrasenaUnroutedComponent } from './shared/shared.recuperarcontrasena.unrouted/shared.recuperarcontrasena.unrouted.component';
import { SharedRestablecerContrasenaUnroutedComponent } from './shared/shared.restablecercontrasena.unrouted/shared.restablecercontrasena.unrouted.component';
import { ProveedorGuard } from './guards/proveedor.guard';
import { ProductoAdminCreateRoutedComponent } from './component/producto/producto.admin.create.routed/producto.admin.create.routed.component';


export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: SharedHomeRoutedComponent },
  
    // Rutas de administrador
    { path: 'admin/producto/plist', component: ProductoAdminPlistRoutedComponent, canActivate: [AdminGuard] },
    { path: 'admin/producto/edit/:id', component: ProductoAdminEditRoutedComponent, canActivate: [AdminOrProveedorGuard] },
    { path: 'admin/producto/view/:id', component: ProductoAdminViewRoutedComponent, canActivate: [AdminOrProveedorGuard] },
    { path: 'admin/producto/new', component: ProductoAdminCreateRoutedComponent, canActivate: [ProveedorGuard] },
  
    // Rutas de proveedor
    { path: 'admin/producto/xproveedor/plist', component: ProductoAdminXProveedorPlistRoutedComponent, canActivate: [AdminOrProveedorGuard] },
  
    // Login / logout
    { path: 'login', component: SharedLoginRoutedComponent },
    { path: 'logout', component: SharedLogoutRoutedComponent },

    { path: 'bynif/:nif', component: SharedBynifRoutedComponent , canActivate: [AdminOrProveedorGuard] },
    { path: 'recuperar-password', component: SharedRecuperarContrasenaUnroutedComponent },
    { path: 'restablecer-password', component: SharedRestablecerContrasenaUnroutedComponent },


    { path: '**', redirectTo: 'home', pathMatch: 'full' }
  ];
  
