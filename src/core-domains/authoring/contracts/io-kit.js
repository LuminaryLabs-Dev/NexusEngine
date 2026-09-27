import { createDomainKit } from '../../domain-kit.js';
import { authoringServiceLifecycle } from './service-lifecycle.js';
import { rawMutation, requireFields } from './value.js';
import { copy, record } from './io.js';
/** Shared kit plumbing only; each manifest/service retains its own responsibility. */
export function createAuthoringIOKit(manifest, install, config={}) {
  requireFields(config, [], `${manifest.id} configuration`);
  return createDomainKit({
    manifestId:manifest.id,id:manifest.id,domain:manifest.id.replace(/-kit$/,''),
    domainPath:manifest.domainPath,parentDomainPath:manifest.parentDomainPath,
    apiName:manifest.apiName,requires:manifest.requires,provides:manifest.provides,
    config,purpose:manifest.responsibility,
    createApi({engine,world,State,baseApi}) {
      const context={
        engine,project:engine.n.authoringProject,kitId:manifest.id,
        read:()=>copy(world.getResource(State).ioState??{}),
        write:value=>{const current=world.getResource(State);world.setResource(State,{...current,ioState:record(value)});}
      };
      const service=install(context);
      return {
        ...baseApi,...authoringServiceLifecycle(manifest.id,()=>service.dispose?.()),...service,
        getState:()=>service.getSnapshot?.()??baseApi.getState(),
        update:rawMutation,applyCommand:rawMutation,configure:rawMutation,setDescriptor:rawMutation
      };
    }
  });
}
