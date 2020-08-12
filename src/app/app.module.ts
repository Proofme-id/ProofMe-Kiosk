import 'reflect-metadata';
import '../polyfills';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, FormBuilder } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { COMPONENTS } from './components';
import { AppRoutingModule } from './app-routing.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { StorageService } from './storage/storage.service';
import { ConfigProvider } from './providers/configProvider';
import { HasConfigGuard } from './guards/has-config.guard';
import { ConfigComponent } from './features/config/config.component';
import { HomeComponent } from './features/home/home.component';
import { InstallComponent } from './features/install/install.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from "@angular/material/dialog";
import { DeleteAdminDialogComponent } from './dialogs/delete-admin-dialog/delete-admin.dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Web3Provider } from './providers/web3Provider';
import { EnrollComponent } from './features/enroll/enroll.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        ...COMPONENTS,
        AppComponent,
        ConfigComponent,
        HomeComponent,
        InstallComponent,
        ConfigComponent,
        EnrollComponent,
        DeleteAdminDialogComponent
    ],
    imports: [
        BrowserModule,
        FontAwesomeModule,
        FormsModule,
        HttpClientModule,
        CoreModule,
        SharedModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatTableModule,
        MatPaginatorModule,
        MatSlideToggleModule,
        MatSortModule,
        MatIconModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatTabsModule,
        MatSnackBarModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    providers: [
        StorageService,
        ConfigProvider,
        Web3Provider,
        FormBuilder,
        HasConfigGuard,
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false }}
    ],
    bootstrap: [AppComponent],
    entryComponents: [DeleteAdminDialogComponent]
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIconPacks(far, fas, fab);
    }
}
