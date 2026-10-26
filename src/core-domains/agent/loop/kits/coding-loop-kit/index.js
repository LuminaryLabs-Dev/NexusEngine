export async function runCodingLoop({goal,inspect,propose,apply,validate,authorize}={}){
 for(const fn of [inspect,propose,apply,validate,authorize])if(typeof fn!=="function")throw new TypeError("Coding providers required");
 const context=await inspect({goal});
 const proposal=await propose({goal,context});
 if(!proposal?.id||!proposal?.expectedRevision||!proposal?.operation)throw new TypeError("Invalid coding proposal");
 if(await authorize(proposal)!==true)return {status:"unauthorized",ok:false};
 const receipt=await apply(proposal);
 if(!receipt?.receiptRef)return {status:"uncertain",ok:false};
 if(receipt.ok!==true)return {status:"failed",ok:false,receiptRef:receipt.receiptRef};
 const validation=await validate({goal,proposal,receipt});
 return {status:validation?.ok===true?"complete":"failed",ok:validation?.ok===true,receiptRef:receipt.receiptRef,validation};
}
