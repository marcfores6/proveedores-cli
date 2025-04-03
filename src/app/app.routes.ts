import { Routes } from '@angular/router';
import { SharedHomeRoutedComponent } from './shared/shared.home.routed/shared.home.routed.component';
import { ProductoAdminCreateRoutedComponent } from './component/producto/producto.admin.create.routed/producto.admin.create.routed.component';
import { ProductoAdminDeleteRoutedComponent } from './component/producto/producto.admin.delete.routed/producto.admin.delete.routed.component';
import { ProductoAdminEditRoutedComponent } from './component/producto/producto.admin.edit.routed/producto.admin.edit.routed.component';
import { SharedLoginRoutedComponent } from './shared/shared.login.routed/shared.login.routed';
import { SharedLogoutRoutedComponent } from './shared/shared.logout.routed/shared.logout.routed';
import { ProductoAdminViewRoutedComponent } from './component/producto/producto.admin.view.routed/producto.admin.view.routed.component';
import { ProductoAdminPlistRoutedComponent } from './component/producto/producto.admin.plist.routed/producto.admin.plist.routed.component';



export const routes: Routes = [

    { path: '', component: SharedHomeRoutedComponent },
    { path: 'home', component: SharedHomeRoutedComponent },
    { path: 'login', component: SharedLoginRoutedComponent },
    { path: 'logout', component: SharedLogoutRoutedComponent },

    { path: 'admin/producto/delete/:id', component: ProductoAdminDeleteRoutedComponent},
    { path: 'admin/producto/view/:id', component: ProductoAdminViewRoutedComponent},
    { path: 'admin/producto/edit/:id', component: ProductoAdminEditRoutedComponent},
    { path: 'admin/producto/plist', component: ProductoAdminPlistRoutedComponent},

    
];
