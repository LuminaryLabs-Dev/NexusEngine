import {createDomainKit} from "../../../../domain-kit.js";
import {createModelDescriptor} from "./model-descriptors.js";
export * from "./model-registry.js";
export * from "./model-descriptors.js";
const clone=x=>x===undefined?undefined:structuredClone(x);
export function createModelKit(config={}){
 const models=(config.models??[]).map(createModelDescriptor);
 return createDomainKit({...config,manifestId:"model-registry-kit",id:config.id??"model-registry-kit",
  domainPath:config.domainPath??"n:compute:model",parentDomainPath:config.parentDomainPath??"n:compute",
  domain:"model",apiName:config.apiName??"model",
  purpose:"Register model identities, descriptors and capabilities; inference execution belongs to n:inference.",
  owns:["model registry","model descriptors","model capabilities"],
  doesNotOwn:["inference execution","inference requests","inference results","network transport","provider credentials"],
  descriptors:{...(config.descriptors??{}),models:Object.fromEntries(models.map(m=>[m.id,m]))},
  metadata:{...(config.metadata??{}),piecesFirst:true,providerNeutral:true},
  createApi(context){const {baseApi}=context;return {
   registerModel(input={}){
    const m=createModelDescriptor(input),old=baseApi.getDescriptors("models")[m.id];
    if(old){if(JSON.stringify(old)!==JSON.stringify(m))throw new Error("Model descriptor "+m.id+" already exists with different content.");return clone(old);}
    baseApi.setDescriptor("models",m.id,m);return clone(m);
   },getModels(){return Object.values(baseApi.getDescriptors("models"));},
   ...(config.createApi?.(context)??{})};
  }
 });
}
