import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatToolbarModule} from '@angular/material';

const materialModules = [
  MatButtonModule,
  MatToolbarModule
];

@NgModule({
  imports: [BrowserAnimationsModule].concat(materialModules),
  exports: materialModules
})
export class LaunchMaterialModule {
}
