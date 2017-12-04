import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LaunchMaterialModule} from './custom-modules/material.module';
import {HttpClientModule} from '@angular/common/http';
import {LeafletMarkerClusterModule} from '@asymmetrik/ngx-leaflet-markercluster';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    LeafletModule.forRoot(),
    LeafletMarkerClusterModule.forRoot(),
    LaunchMaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
