import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  GestureConfig, MatButtonModule, MatIconModule, MatInputModule, MatSliderModule,
  MatToolbarModule
} from '@angular/material';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';

const materialModules = [
  MatButtonModule,
  MatToolbarModule,
  MatSliderModule,
  MatIconModule,
  MatInputModule
];

@NgModule({
  imports: [BrowserAnimationsModule].concat(materialModules),
  exports: materialModules,
  providers: [
    {provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig}
  ]
})
export class LaunchMaterialModule {
}
