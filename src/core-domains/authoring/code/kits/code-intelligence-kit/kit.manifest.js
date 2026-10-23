import { atomicKit } from '../../../../manifest-input.js';
const manifest = atomicKit({ id: 'code-intelligence-kit', responsibility: 'Own revision-bound language intelligence requests and proposed edits.', domainPath: 'n:authoring:code:intelligence', apiName: 'codeIntelligence', requires: ['authoring:code-document'], provides: ['authoring:code-intelligence'], module: './src/core-domains/authoring/code/kits/code-intelligence-kit/index.js', exportName: 'createCodeIntelligenceKit', publicSubpath: './domains/authoring/code/code-intelligence', proofReferences: ['tests/toolchain-code.mjs'] });
manifest.reset.semantics = 'Clear derived service state; Project owns source documents and history.';
manifest.snapshot.schema = { type: 'object', required: ['schema', 'kitId'], additionalProperties: false, properties: { schema: { const: 'nexusengine.authoring-service/1' }, kitId: { const: manifest.id } } };
export default manifest;
