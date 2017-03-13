import * as fs from 'fs';
import { Request, Response, Send } from 'express';
import { Provider, NgModuleFactory, NgModuleRef, PlatformRef, ApplicationRef, Type } from '@angular/core';
import { platformServer, platformDynamicServer, PlatformState, INITIAL_CONFIG } from '@angular/platform-server';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';


export interface UniversalOnInit {
  universalOnInit(moduleRef?: NgModuleRef<{}>, setupOptions?: NgSetupOptions);
}
/**
 * These are the allowed options for the engine
 */
export interface NgSetupOptions {
  universalOnInit?: string;
  ngModule: Type<{}> | NgModuleFactory<{}>;
  providers?: Provider[];
}

/**
 * This holds a cached version of each index used.
 */
const templateCache: { [key: string]: string } = {};

/**
 * This is an express engine for handling Angular Applications
 */
export function ngExpressEngine(setupOptions: NgSetupOptions) {

  setupOptions.providers = setupOptions.providers || [];
  setupOptions.universalOnInit = setupOptions.universalOnInit || 'universalOnInit';

  return function (filePath, options: { req: Request, res?: Response }, callback: Send) {
    try {
      const moduleFactory = setupOptions.ngModule;

      if (!moduleFactory) {
        throw new Error('You must pass in a NgModule or NgModuleFactory to be bootstrapped');
      }

      const extraProviders = setupOptions.providers.concat(
        getReqResProviders(options.req, options.res),
        [
          {
            provide: INITIAL_CONFIG,
            useValue: {
              document: getDocument(filePath),
              url: options.req.url
            }
          }
        ]);

      const moduleRefPromise = moduleFactory.constructor === NgModuleFactory ?
        platformServer(extraProviders).bootstrapModuleFactory(<NgModuleFactory<{}>>moduleFactory) :
        platformDynamicServer(extraProviders).bootstrapModule(<Type<{}>>moduleFactory);

      moduleRefPromise.then((moduleRef: NgModuleRef<{}>) => {
        handleModuleRef(moduleRef, callback, setupOptions);
      });

    } catch (e) {
      callback(e);
    }
  };
}

function getReqResProviders(req: Request, res: Response): Provider[] {
  const providers: Provider[] = [
    {
      provide: 'REQUEST',
      useValue: req
    }
  ];
  if (res) {
    providers.push({
      provide: 'RESPONSE',
      useValue: res
    });
  }
  return providers;
}

/**
 * Get the document at the file path
 */
function getDocument(filePath: string): string {
  return templateCache[filePath] = templateCache[filePath] || fs.readFileSync(filePath).toString();
}

/**
 * Handle the request with a given NgModuleRef
 */
function handleModuleRef(moduleRef: NgModuleRef<{}>, callback: Send, setupOptions: NgSetupOptions) {
  const state = moduleRef.injector.get(PlatformState);
  const appRef = moduleRef.injector.get(ApplicationRef);

  appRef.isStable
    .filter((isStable: boolean) => isStable)
    .first()
    .subscribe((stable) => {
      moduleRef.instance[setupOptions.universalOnInit](moduleRef, setupOptions);

      callback(null, state.renderToString());
      moduleRef.destroy();
    });
}
