import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { HasConfigGuard } from './guards/has-config.guard';
import { HomeComponent } from './home/home.component';
import { InstallComponent } from './install/install.component';
import { ConfigComponent } from './config/config.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [HasConfigGuard]
    },
    {
        path: 'install',
        component: InstallComponent
    },
    {
        path: 'config',
        component: ConfigComponent
    },
    // {
    //     path: '**',
    //     component: PageNotFoundComponent
    // }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
