import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { ServerTransferStateModule, TransferState } from '@angularclass/universal-transfer-state/server';
import { UniversalOnInit } from '@angularclass/universal-express';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({
      appId: 'my-app-id'
    }),
    ServerModule,
    ServerTransferStateModule,
    AppModule
  ]
})
export class ServerAppModule implements UniversalOnInit {

  constructor(private transferState: TransferState) { }

  // Gotcha
  universalOnInit() {
    this.transferState.inject();
  }
}
