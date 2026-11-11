import test from 'node:test';
import assert from 'node:assert/strict';
import { createQualityProfile } from '../../src/core-domains/render/pipeline/quality-profiles.js';

test('quality defaults and existing profile settings remain unchanged',()=>{
  assert.deepEqual(createQualityProfile(),{
    id:'quality-profile',renderScale:1,shadows:'auto',effects:'auto',lodBias:0,metadata:{}
  });
  assert.equal(createQualityProfile({id:'mobile',renderScale:.7,lodBias:-1,shadows:'low'}).renderScale,.7);
});
test('reject invalid renderScale before allocating render targets',()=>{
  for(const renderScale of [0,-1,Infinity,-Infinity,NaN,'invalid']){
    assert.throws(()=>createQualityProfile({renderScale}), /renderScale/);
  }
});
test('reject nonfinite lodBias before geometry selection',()=>{
  for(const lodBias of [Infinity,NaN,'invalid']){
    assert.throws(()=>createQualityProfile({lodBias}), /lodBias/);
  }
});
