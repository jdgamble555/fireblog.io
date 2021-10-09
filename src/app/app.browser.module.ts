import { NgModule } from '@angular/core';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';



@NgModule({
  declarations: [],
  imports: [
    AppModule,
    provideAnalytics(() => getAnalytics())
  ],
  bootstrap: [AppComponent]
})
export class AppBrowserModule { }
