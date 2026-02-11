import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // Vérifiez le nom de l'export

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));