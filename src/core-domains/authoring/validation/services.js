import { issue, report } from '../contracts/io.js';
const attempt=(fn,details)=>{try{fn();return report([],{source:details});}catch(e){return report([issue(e.code??'AUTHORING_INVALID',e.message,'error',e.details??{})],{source:details});}};
export const installDocumentValidation=({project})=>({validate(id){
  const context=project.context();return attempt(()=>{project.getDocument(id);project.validate();},{...context,documentId:id});
}});
export const installProjectValidation=({project})=>({validate(){return attempt(()=>project.validate(),project.context());}});
export const installDeliveryValidation=({engine,project})=>({validate(profile){return attempt(()=>engine.n.authoringPublishing.prepare(profile),project.context());}});
export const installFormatValidation=({engine})=>({validate(input){return engine.n.authoringExport.inspect(input);},artifact(input){return engine.n.authoringExportValidation.validate(input);}});
export const installValidationReport=({engine})=>({
  report,
  document:id=>engine.n.authoringDocumentValidation.validate(id),
  project:()=>engine.n.authoringProjectValidation.validate(),
  delivery:input=>engine.n.authoringDeliveryValidation.validate(input),
  format:input=>engine.n.authoringFormatValidation.validate(input),
  artifact:input=>engine.n.authoringFormatValidation.artifact(input)
});
