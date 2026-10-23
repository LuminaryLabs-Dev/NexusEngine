import { createDomainKit } from '../../../../domain-kit.js';
import { authoringServiceLifecycle } from '../../../contracts/service-lifecycle.js';
import { rawMutation, requireFields } from '../../../contracts/value.js';
import { installCodeDocumentServices } from '../../services.js';
import { createCodeIntelligenceService } from '../../intelligence.js';
export function createCodeDocumentKit(config = {}) {
    requireFields(config, [], 'code-document config');
    return createDomainKit({ manifestId: 'code-document-kit', id: 'code-document-kit', domain: 'authoring-code', domainPath: 'n:authoring:code', parentDomainPath: 'n:authoring', apiName: 'authoringCode', requires: ['n:authoring:project'], provides: ['authoring:code-document'], purpose: 'Own revisioned source-code document operations.', createApi({ engine, baseApi }) { const service = installCodeDocumentServices(engine.n.authoringProject); return { ...baseApi, ...service, ...authoringServiceLifecycle('code-document-kit', () => service.clear?.()), update: rawMutation, applyCommand: rawMutation, configure: rawMutation, setDescriptor: rawMutation }; } });
}
