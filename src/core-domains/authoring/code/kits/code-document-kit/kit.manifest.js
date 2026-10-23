import { atomicKit } from '../../../../manifest-input.js';
const manifest = atomicKit({ id: 'code-document-kit', responsibility: 'Own revisioned source-code document operations.', domainPath: 'n:authoring:code', apiName: 'authoringCode', requires: ['n:authoring:project'], provides: ['authoring:code-document'], module: './src/core-domains/authoring/code/kits/code-document-kit/index.js', exportName: 'createCodeDocumentKit', publicSubpath: './domains/authoring/code/code-document', proofReferences: ['tests/toolchain-code.mjs'] });
manifest.reset.semantics = 'Clear derived service state; Project owns source documents and history.';
manifest.snapshot.schema = { type: 'object', required: ['schema', 'kitId'], additionalProperties: false, properties: { schema: { const: 'nexusengine.authoring-service/1' }, kitId: { const: manifest.id } } };
export default manifest;
