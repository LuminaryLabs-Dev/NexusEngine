import {createDomainKit} from '../../domain-kit.js';
import {createAgentWorker, restoreAgentWorker, assignAgentWorker, transitionAgentWorker} from './worker.js';
export * from './worker.js';

export function createAgentWorkerKit(config = {}) {
  const maxWorkers = config.maxWorkers ?? 64;
  if (!Number.isSafeInteger(maxWorkers) || maxWorkers < 1) throw new RangeError('Invalid worker count');
  return createDomainKit({...config, id:'agent-worker-kit', manifestId:'agent-worker-kit', domain:'agent-worker', apiName:'agentWorker',
    config:{maxWorkers}, initialState:{workers:[]}, createApi:({baseApi}) => {
      const read = id => {
        const worker = baseApi.getState().workers.find(w => w.id === id);
        if (!worker) throw new Error('Unknown worker');
        return restoreAgentWorker(worker);
      };
      const save = worker => {
        worker = restoreAgentWorker(worker);
        const workers = baseApi.getState().workers.filter(w => w.id !== worker.id);
        workers.push(worker); baseApi.update({workers}); return restoreAgentWorker(worker);
      };
      return {
        create(input) {
          const workers = baseApi.getState().workers;
          if (workers.length >= maxWorkers || workers.some(w => w.id === input.id)) throw new Error('Duplicate worker or worker limit reached');
          return save(createAgentWorker(input));
        },
        read,
        assign:(id, assignment, options) => save(assignAgentWorker(read(id), assignment, options)),
        transition:(id, status, options) => save(transitionAgentWorker(read(id), status, options)),
        loadSnapshot(value) {
          if (!Array.isArray(value?.workers) || value.workers.length > maxWorkers || new Set(value.workers.map(w => w.id)).size !== value.workers.length) throw new TypeError('Invalid worker kit snapshot');
          const workers = value.workers.map(restoreAgentWorker);
          return baseApi.loadSnapshot({...value, workers});
        }
      };
    }});
}
