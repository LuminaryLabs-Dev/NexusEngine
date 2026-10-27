import {createDomainKit} from '../../domain-kit.js';
import {createAgentGoalMap} from './goals.js';
export * from './goals.js';

/** Goals use the installed Graph kit as their sole topology/state owner. */
export function createAgentGoalKit(config={}) {
  return createDomainKit({...config,id:'agent-goal-kit',manifestId:'agent-goal-kit',domain:'agent-goal',apiName:'agentGoal',policies:{verifiers:config.verifiers??{},authorizeSupersession:config.authorizeSupersession??null},
    createApi:({engine})=>({
      map(id,options={}) {
        const graphs=engine.n.agentGraph;
        if(!graphs) throw new Error('Agent Graph kit must be installed');
        return createAgentGoalMap({graph:{limits:graphs.getConfig().limits,snapshot:()=>graphs.read(id),apply:p=>graphs.apply(id,p),traverse:(start,opts)=>graphs.traverse(id,start,opts)},
          verifiers:options.verifiers??config.verifiers??{},authorizeSupersession:options.authorizeSupersession??config.authorizeSupersession??(()=>false)});
      }
    })});
}
