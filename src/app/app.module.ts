import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LaunchMaterialModule} from './custom-modules/material.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    LeafletModule.forRoot(),
    LaunchMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
