import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import {
  Location,
  PathLocationStrategy,
  LocationStrategy
} from '@angular/common';

import { NgxElectronModule, ElectronService } from 'ngx-electron';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
// import { NgSelectModule } from '@ng-select/ng-select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MatMomentDateModule } from '@angular/material-moment-adapter';

import {
  MatCardModule,
  MatDialogModule,
  MatListModule,
  MatOptionModule,
  MatSelectModule,
  MatInputModule,
  MatToolbarModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatSnackBarModule,
  MatMenuModule,
  MatIconModule,
  MatSlideToggleModule,
  MatAutocompleteModule,
  MatButtonToggleModule,
  MatTableModule,
  MatBadgeModule,
  MatBottomSheetModule
} from '@angular/material';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { environment } from '../environments/environment';

import { AlertDirective } from './_directives/alert.directive';
import { JwtInterceptor } from './_helpers';
import { AuthGuard } from './_guards/auth.guard';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { fakeBackendProvider } from './_helpers';

import { HomeComponent } from './screens/home/home.component';
import { LoginComponent } from './screens/login/login.component';
import { HeaderToolbarComponent } from './header-toolbar/header-toolbar.component';
import { DataService } from './_services/data/data.service';
import { HaulsComponent } from './screens/hauls/hauls.component';
import { TripsComponent } from './screens/trips/trips.component';
import { TripEditComponent } from './screens/trips/trip-edit/trip-edit.component';
import { StateService } from './_services/data/state.service';
import { TallyComponent } from './screens/tally/tally.component';
import { TripListComponent } from './screens/trips/trip-list/trip-list.component';
import { HaulEditComponent } from './screens/hauls/haul-edit/haul-edit.component';
import { HaulListComponent } from './screens/hauls/haul-list/haul-list.component';
import { SettingsComponent } from './screens/settings/settings.component';
import { ThemeService } from './_services/ui/theme.service';
import { TallyHistoryComponent } from './screens/tally/tally-history/tally-history.component';
import { AddNamedComponent } from './screens/tally/add-named/add-named.component';
import { KeyboardDirective } from './_directives/keyboard.directive';
import { PdfGenerationService } from './_services/pdf/pdf-generation.service';
import { TallyPdfComponent } from './screens/tally/tally-pdf/tally-pdf.component';
import { AuthenticationService } from './_services/auth/authentication.service';
import { UserService } from './_services/data/user.service';
import { AlertService } from './_services/ui/alert.service';
import { CountsWeightsComponent } from './screens/tally/counts-weights/counts-weights.component';
import { TemplateManagerComponent } from './screens/tally/template-manager/template-manager.component';
import { TemplateService } from './_services/data/tally/template.service';
import { BackupComponent } from './screens/backup/backup.component';

import { DragDropModule } from 'primeng/dragdrop';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import {ProgressSpinnerModule} from 'primeng/progressspinner';

import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { FramNumpadComponent } from './screens/fram-numpad/fram-numpad.component';

@NgModule({
  declarations: [
    AppComponent,
    AlertDirective,
    HomeComponent,
    LoginComponent,
    HeaderToolbarComponent,
    HaulsComponent,
    KeyboardDirective,
    TripsComponent,
    TripEditComponent,
    TallyComponent,
    TripListComponent,
    HaulEditComponent,
    HaulListComponent,
    SettingsComponent,
    AddNamedComponent,
    TallyHistoryComponent,
    TallyPdfComponent,
    CountsWeightsComponent,
    TemplateManagerComponent,
    BackupComponent,
    FramNumpadComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    FormsModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatListModule,
    MatSelectModule,
    MatTableModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatOptionModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatMenuModule,
    MatIconModule,
    MatSlideToggleModule,
    NgxDatatableModule,
    HttpClientModule,
    AutoCompleteModule,
    AppRoutingModule,
    MatMomentDateModule,
    ConfirmDialogModule,
    DragDropModule,
    MessagesModule,
    MessageModule,
    ProgressSpinnerModule,
    TableModule,
    MatCheckboxModule,
    MatRadioModule,
    ToggleButtonModule,
    SelectButtonModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    InputMaskModule,
    DialogModule,
    TabViewModule
    ],
  providers: [
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    fakeBackendProvider,
    DataService,
    StateService,
    ThemeService,
    TemplateService,
    Location,
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    ElectronService,
    PdfGenerationService,
    ConfirmationService
  ],
  entryComponents: [
    TallyHistoryComponent,
    AddNamedComponent,
    CountsWeightsComponent,
    TemplateManagerComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}