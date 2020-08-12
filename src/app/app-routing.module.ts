import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { HasConfigGuard } from './guards/has-config.guard';
import { HomeComponent } from './features/home/home.component';
import { InstallComponent } from './features/install/install.component';
import { ConfigComponent } from './features/config/config.component';
import { EnrollComponent } from './features/enroll/enroll.component';

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
        path: 'enroll',
        component: EnrollComponent,
        canActivate: [HasConfigGuard]
    },
    {
        path: 'config',
        component: ConfigComponent,
        canActivate: [HasConfigGuard]
    },
    {
        path: 'install',
        component: InstallComponent
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
