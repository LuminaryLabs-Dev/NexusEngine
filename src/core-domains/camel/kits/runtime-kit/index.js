import {createDomainKit} from '../../../domain-kit.js';
import {createCamelRuntime} from '../../execution/runtime.js';
export function createCamelRuntimeKit(config={}){
 return createDomainKit({
  ...config,config:{allowCalls:config.allowCalls??[],hostCapabilities:config.hostCapabilities??[],filename:config.filename??null,steps:config.steps??100000,tasks:config.tasks??64,callDepth:config.callDepth??128},manifestId:'camel-runtime-kit',id:'camel-runtime-kit',domain:'camel',domainPath:'n:camel',apiName:'camel',
  provides:['n:camel','camel:execution'],requires:[],
  purpose:'Execute the bundled Camel interpreter against the installed Nexus API registry.',
  owns:['Camel invocation state','Camel runtime source identity','Camel language API binding'],
  doesNotOwn:['other domain state','composition planning','model weights','application rules'],
  createApi(context){return createCamelRuntime(context.engine,config);}
 });
}
