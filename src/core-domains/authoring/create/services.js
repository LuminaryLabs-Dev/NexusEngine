import { requireFields, requireText } from '../contracts/value.js';
export function installCreate({project}) {
  return {
    kinds:()=>project.kinds(),
    create(input) {
      requireFields(input,['requestId','epoch','kind','id','primitive','parameters','content'],'create request');
      const {requestId,kind,id}=input; requireText(requestId,'requestId'); requireText(id,'document ID');
      let operation;
      if(kind==='mesh') operation=input.content ? {id:'mesh.create',args:{id,mesh:input.content}} :
        {id:'mesh.primitive',args:{id,parameters:{...input.parameters,type:input.primitive??'box'}}};
      else operation={id:`${kind==='image'?'paint':kind}.set`,args:{id,content:input.content??{}}};
      return project.execute({requestId,epoch:input.epoch??project.context().epoch,operations:[operation]});
    }
  };
}
