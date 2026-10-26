import {createAgentTaskGraph} from "../../../interaction/task-graph.js";
export async function planLoopWork({goal,propose}={}){
 if(!goal||typeof propose!=="function")throw new TypeError("Planning goal and provider required");
 const plan=await propose({goal});
 if(!Array.isArray(plan?.nodes))throw new TypeError("Plan requires task nodes");
 const graph=createAgentTaskGraph(plan.nodes);
 return {schema:"nexusengine.agent.loop.plan/1",goal,graph:graph.snapshot(),ready:graph.ready(),requirements:structuredClone(plan.requirements??[])};
}
