import { createDomainKit } from '../../../../domain-kit.js';
import { authoringServiceLifecycle } from '../../../contracts/service-lifecycle.js';
import { rawMutation, requireFields } from '../../../contracts/value.js';
import { installCodeDocumentServices } from '../../services.js';
import { createCodeIntelligenceService } from '../../intelligence.js';
export function createCodeIntelligenceKit(config = {}) {
    requireFields(config, [], 'code-intelligence config');
    return createDomainKit({ manifestId: 'code-intelligence-kit', id: 'code-intelligence-kit', domain: 'authoring-code', domainPath: 'n:authoring:code:intelligence', parentDomainPath: 'n:authoring:code', apiName: 'codeIntelligence', requires: ['authoring:code-document'], provides: ['authoring:code-intelligence'], purpose: 'Own revision-bound language intelligence requests and proposed edits.', createApi({ engine, baseApi }) { const service = createCodeIntelligenceService(engine.n.authoringProject, engine.n.authoringCode); return { ...baseApi, ...service, ...authoringServiceLifecycle('code-intelligence-kit', () => service.clear?.()), update: rawMutation, applyCommand: rawMutation, configure: rawMutation, setDescriptor: rawMutation }; } });
}
