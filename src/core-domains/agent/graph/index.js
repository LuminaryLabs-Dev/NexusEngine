import {createDomainKit} from '../../domain-kit.js';
import {createAgentGraph,agentGraphLimits} from './graph.js';
export * from './graph.js';

export function createAgentGraphKit(config={}) {
  const limits=agentGraphLimits(config.limits),maxGraphs=config.maxGraphs??32;
  if(!Number.isSafeInteger(maxGraphs)||maxGraphs<1) throw new RangeError('Invalid graph count');
  return createDomainKit({...config,id:'agent-graph-kit',manifestId:'agent-graph-kit',domain:'agent-graph',apiName:'agentGraph',
    config:{limits,maxGraphs},initialState:{graphs:[]},createApi:({baseApi})=>{
      const read=id=>{const s=baseApi.getState().graphs.find(g=>g.id===id);if(!s) throw new Error('Unknown Agent graph');return createAgentGraph({snapshot:s,limits});};
      const save=graph=>{const snapshot=graph.snapshot(),graphs=baseApi.getState().graphs.filter(g=>g.id!==snapshot.id);graphs.push(snapshot);baseApi.update({graphs});};
      return {
        create(input) {if(baseApi.getState().graphs.some(g=>g.id===input.id)) throw new Error('Graph already exists');if(baseApi.getState().graphs.length>=maxGraphs) throw new RangeError('Graph count exceeded');const g=createAgentGraph({...input,snapshot:null,limits});save(g);return g.snapshot();},
        read:id=>read(id).snapshot(),
        apply(id,patch) {const g=read(id),receipt=g.apply(patch);save(g);return receipt;},
        traverse:(id,start,options)=>read(id).traverse(start,options),
        loadSnapshot(value) {
          if(!Array.isArray(value?.graphs)||value.graphs.length>maxGraphs||new Set(value.graphs.map(g=>g.id)).size!==value.graphs.length) throw new TypeError('Invalid Graph kit snapshot');
          const graphs=value.graphs.map(s=>createAgentGraph({snapshot:s,limits}).snapshot());
          return baseApi.loadSnapshot({...value,graphs});
        }
      };
    }});
}
