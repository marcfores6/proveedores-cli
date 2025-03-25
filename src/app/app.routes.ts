import { Routes } from '@angular/router';
import { SharedHomeRoutedComponent } from './shared/shared.home.routed/shared.home.routed.component';
import { ProductoAdminCreateRoutedComponent } from './component/producto/producto.admin.create.routed/producto.admin.create.routed.component';
import { ProductoAdminDeleteRoutedComponent } from './component/producto/producto.admin.delete.routed/producto.admin.delete.routed.component';
import { ProductoAdminViewRoutedComponent } from './component/producto/producto.admin.view.routed/producto.admin.view.routed.component';
import { ProductoAdminEditRoutedComponent } from './component/producto/producto.admin.edit.routed/producto.admin.edit.routed.component';
import { ProductoAdminPlistRoutedComponent } from './component/producto/producto.admin.plist.routed/producto.admin.plist.routed.component';
import { ProveedorAdminCreateRoutedComponent } from './component/proveedor/proveedor.admin.create.routed/proveedor.admin.create.routed.component';
import { ProveedorAdminDeleteRoutedComponent } from './component/proveedor/proveedor.admin.delete.routed/proveedor.admin.delete.routed.component';
import { ProveedorAdminEditRoutedComponent } from './component/proveedor/proveedor.admin.edit.routed/proveedor.admin.edit.routed.component';
import { ProveedorAdminPlistRoutedComponent } from './component/proveedor/proveedor.admin.plist.routed/proveedor.admin.plist.routed.component';
import { ProveedorAdminViewRoutedComponent } from './component/proveedor/proveedor.admin.view.routed/proveedor.admin.view.routed.component';


export const routes: Routes = [

    { path: '', component: SharedHomeRoutedComponent },
    { path: 'home', component: SharedHomeRoutedComponent },

    { path: 'admin/producto/create', component: ProductoAdminCreateRoutedComponent},
    { path: 'admin/producto/delete/:codigo', component: ProductoAdminDeleteRoutedComponent},
    { path: 'admin/producto/view/:codigo', component: ProductoAdminViewRoutedComponent},
    { path: 'admin/producto/edit/:codigo', component: ProductoAdminEditRoutedComponent},
    { path: 'admin/producto/plist', component: ProductoAdminPlistRoutedComponent},

    { path: 'admin/proveedor/create', component: ProveedorAdminCreateRoutedComponent},
    { path: 'admin/proveedor/delete/:id', component: ProveedorAdminDeleteRoutedComponent},
    { path: 'admin/proveedor/view/:id', component: ProveedorAdminViewRoutedComponent},
    { path: 'admin/proveedor/edit/:id', component: ProveedorAdminEditRoutedComponent},
    { path: 'admin/proveedor/plist', component: ProveedorAdminPlistRoutedComponent},
    
];
