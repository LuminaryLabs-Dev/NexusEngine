import { createAgentTaskGraph } from "./task-graph.js";
import { createAgentAnswerSession } from "./answer-session.js";
const clone = value => structuredClone(value);
/** Portable definitions and session state; no tool execution, model or filesystem. */
export function createAgentWorkflowStore({ maxSessions = 256, maxSessionBytes = 65536, maxGraphBytes = 65536, maxWorkflows = 256 } = {}) {
  for(const limit of [maxSessions,maxSessionBytes,maxGraphBytes,maxWorkflows])if(!Number.isSafeInteger(limit)||limit<1)throw new RangeError("Invalid interaction budget.");
  const definitions = new Map(), graphs = new Map(), sessions = new Map();
  const room = map => { if (map.size >= maxSessions) throw new Error("Active session budget reached; snapshot completed sessions before releasing them."); };
  return {
    limits:Object.freeze({maxSessions,maxSessionBytes,maxGraphBytes,maxWorkflows}),
    register(definition) {
      if (!definition?.id || !Array.isArray(definition.nodes)) throw new TypeError("Workflow requires id and task nodes.");
      createAgentTaskGraph(definition.nodes,{maxBytes:maxGraphBytes});
      if(!definitions.has(definition.id)&&definitions.size>=maxWorkflows)throw new RangeError("Workflow definition budget exceeded.");
      const previous = definitions.get(definition.id);
      if (previous && JSON.stringify(previous) !== JSON.stringify(definition)) throw new Error("Workflow version/identity conflict.");
      definitions.set(definition.id, clone(definition)); return clone(definition);
    },
    discover: () => [...definitions.values()].map(clone),
    createTask(id, nodes, workflowId) {
      if (graphs.has(id)) throw new Error("Task graph already exists."); room(graphs);
      const definition = workflowId ? definitions.get(workflowId) : null;
      if (workflowId && !definition) throw new Error("Unknown workflow.");
      const graph = createAgentTaskGraph(nodes ?? definition.nodes,{maxBytes:maxGraphBytes}); graphs.set(id, graph); return graph;
    },
    task(id) { const graph = graphs.get(id); if (!graph) throw new Error("Unknown task graph."); return graph; },
    taskIds: () => [...graphs.keys()],
    createSession(id, intent, project) {
      if (sessions.has(id)) throw new Error("Session already exists."); room(sessions);
      const session = createAgentAnswerSession({ id, intent, project, maxBytes:maxSessionBytes }); sessions.set(id, session); return session;
    },
    session(id) { const session = sessions.get(id); if (!session) throw new Error("Unknown session."); return session; },
    sessions: () => [...sessions].map(([id,s]) => ({ id, ...s.context() })),
    next(id) { const graph = this.task(id); return { ready: graph.ready(), snapshot: graph.snapshot() }; },
    snapshot: () => ({ definitions: [...definitions.values()].map(clone), graphs: [...graphs].map(([id,g]) => [id,g.snapshot()]), sessions: [...sessions].map(([id,s]) => [id,s.snapshot()]) }),
    restore(snapshot) {
      const staged = createAgentWorkflowStore({ maxSessions,maxSessionBytes,maxGraphBytes,maxWorkflows });
      for (const d of snapshot.definitions ?? []) staged.register(d);
      for (const [id,g] of snapshot.graphs ?? []) staged.createTask(id,g.nodes).restore(g);
      for (const [id,s] of snapshot.sessions ?? []) staged.createSession(id,s.intent,s.project).resume(s);
      definitions.clear(); graphs.clear(); sessions.clear();
      for (const d of staged.discover()) definitions.set(d.id,d);
      for (const id of staged.taskIds()) graphs.set(id,staged.task(id));
      for (const [id] of snapshot.sessions ?? []) sessions.set(id,staged.session(id));
      return this.snapshot();
    },
    reset() { graphs.clear(); sessions.clear(); return this.snapshot(); }
  };
}
