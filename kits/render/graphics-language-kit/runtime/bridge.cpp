#include "nexusgl/c_api.h"
#include <array>
#include <vector>
#include <algorithm>
#include <string>
#include <map>
#include <cmath>
#include <stdexcept>
#include <limits>
static thread_local std::string bridge_error;
static bool checked_values(const double* v,size_t n) {
    if(!v){bridge_error="Missing bridge values";return false;}
    for(size_t i=0;i<n;i++)if(!std::isfinite(v[i])){bridge_error="Nonfinite or out-of-range bridge value";return false;}
    return true;
}
static bool checked_float_values(const double* v,size_t n) {
    if(!checked_values(v,n))return false;
    for(size_t i=0;i<n;i++)if(std::abs(v[i])>std::numeric_limits<float>::max()){bridge_error="Bridge float value out of range";return false;}return true;
}
static bool checked_integer(double v,int minimum,int maximum) {
    if(v<minimum||v>maximum||std::trunc(v)!=v){bridge_error="Nonintegral or out-of-range bridge field";return false;}return true;
}
extern "C" {
void ng_defaults(int kind, double* v) {
    if (kind == 0) {
        const auto m = nx_default_material();
        const double a[] = {double(m.shading), double(m.alpha_mode),m.tint[0],m.tint[1],m.tint[2],m.roughness,m.metallic,m.opacity,m.alpha_cutoff,m.normal_strength,double(m.bands),double(m.outline_pixels),m.softness,m.highlight,m.rim,m.shadow_color[0],m.shadow_color[1],m.shadow_color[2],m.outline_color[0],m.outline_color[1],m.outline_color[2]};
        std::copy(a,a+21,v);
    } else if (kind == 1) {
        const auto a=nx_default_view();
        std::copy(a.projection,a.projection+16,v); std::copy(a.camera,a.camera+3,v+16);
        std::copy(a.shadow_projection,a.shadow_projection+16,v+19); std::copy(a.light_direction,a.light_direction+3,v+35);
        const double b[]={double(a.shadow_resolution),double(a.closed_back_faces),a.exposure,double(a.sample_scale),a.shadow_bias,a.receiver_plane_clamp,double(a.shadow_filter_radius)};
        std::copy(b,b+7,v+38);
    } else {
        const auto a=nx_default_light();
        const double b[]={a.color[0],a.color[1],a.color[2],a.intensity,a.fill,a.sky,a.sky_gradient,a.specular,a.specular_power};
        std::copy(b,b+9,v);
    }
}
nx_handle ng_material(nx_handle d,nx_handle s,const double* v,nx_handle color,nx_handle normal) {
    bridge_error.clear();
    if(!checked_float_values(v,21)||!checked_integer(v[0],0,3)||!checked_integer(v[1],0,2)||!checked_integer(v[10],2,16)||!checked_integer(v[11],0,4))return 0;
    auto m=nx_default_material();m.shading=int(v[0]);m.alpha_mode=int(v[1]);
    for(int i=0;i<3;i++){m.tint[i]=float(v[2+i]);m.shadow_color[i]=float(v[15+i]);m.outline_color[i]=float(v[18+i]);}
    m.roughness=float(v[5]);m.metallic=float(v[6]);m.opacity=float(v[7]);m.alpha_cutoff=float(v[8]);m.normal_strength=float(v[9]);m.bands=int(v[10]);m.outline_pixels=int(v[11]);m.softness=float(v[12]);m.highlight=float(v[13]);m.rim=float(v[14]);m.color_texture=color;m.normal_texture=normal;
    return nx_material_create(d,s,&m);
}
int ng_view(nx_handle d,nx_handle s,const double* v) {
    bridge_error.clear();
    if(!checked_values(v,45)||!checked_float_values(v+40,1)||!checked_integer(v[38],1,4096)||!checked_integer(v[39],0,1)||!checked_integer(v[41],1,2)||!checked_integer(v[44],0,2))return 0;
    auto a=nx_default_view();std::copy(v,v+16,a.projection);std::copy(v+16,v+19,a.camera);std::copy(v+19,v+35,a.shadow_projection);std::copy(v+35,v+38,a.light_direction);
    a.shadow_resolution=int(v[38]);a.closed_back_faces=int(v[39]);a.exposure=float(v[40]);a.sample_scale=int(v[41]);a.shadow_bias=v[42];a.receiver_plane_clamp=v[43];a.shadow_filter_radius=int(v[44]);return nx_scene_set_view(d,s,&a);
}
int ng_light(nx_handle d,nx_handle s,const double* v) {
    bridge_error.clear();if(!checked_values(v,9)||!checked_float_values(v,3))return 0;
    nx_light a{};std::copy(v,v+3,a.color);a.intensity=v[3];a.fill=v[4];a.sky=v[5];a.sky_gradient=v[6];a.specular=v[7];a.specular_power=v[8];return nx_scene_set_light(d,s,&a);
}
const char* ng_last_error() { return bridge_error.empty()?nx_last_error():bridge_error.c_str(); }
int ng_draw(nx_handle d,nx_handle s,const double* v,size_t count,unsigned color,nx_handle material,int casts,int two) {
    bridge_error.clear();
    if ((!v&&count)||count>SIZE_MAX/36) {bridge_error="Invalid triangle count";return 0;}
    if(!nx_scene_begin(d,s,nx_scene_revision(d,s)))return 0;
    try {
      std::array<nx_triangle,64> triangles{};
      for(size_t base=0;base<count;base+=triangles.size()) {
        const auto n=std::min(triangles.size(),count-base);
        for(size_t i=0;i<n;i++) {
          auto& t=triangles[i];t={};t.material=material;t.casts_shadow=casts;t.two_sided_shadow=two;
          for(int c=0;c<4;c++)t.color[c]=uint8_t(color>>(c*8));
          for(int j=0;j<3;j++) {
            const double* p=v+(base+i)*36+j*12;auto& a=t.vertices[j];
            std::copy(p,p+3,a.position);std::copy(p+3,p+6,a.normal);std::copy(p+6,p+8,a.uv);std::copy(p+8,p+11,a.tangent);a.handedness=p[11];
          }
        }
        if(!nx_draw_triangles(d,s,triangles.data(),n))throw std::runtime_error(nx_last_error());
      }
      if(!nx_scene_commit(d,s))throw std::runtime_error(nx_last_error());
      return 1;
    }catch(const std::exception& e){bridge_error=e.what();nx_scene_abort(d,s);return 0;}
}
nx_handle ng_mesh(nx_handle d,nx_handle s,nx_handle existing,const double* v,size_t count,const uint32_t* indices,size_t index_count) {
    bridge_error.clear();
    static_assert(sizeof(nx_vertex)==12*sizeof(double),"Packed vertex layout");
    if(existing)return nx_mesh_update(d,s,existing,reinterpret_cast<const nx_vertex*>(v),count,indices,index_count)?existing:0;
    return nx_mesh_create(d,s,reinterpret_cast<const nx_vertex*>(v),count,indices,index_count);
}
nx_handle ng_instance(nx_handle d,nx_handle s,nx_handle existing,nx_handle mesh,nx_handle material,const double* column,unsigned color,int casts,int two) {
    bridge_error.clear();if(!column){bridge_error="Missing model matrix";return 0;}
    double row[16];uint8_t rgba[4];
    for(int i=0;i<16;i++)row[i]=column[(i%4)*4+i/4];
    for(int i=0;i<4;i++)rgba[i]=uint8_t(color>>(i*8));
    if(existing)return nx_instance_update(d,s,existing,mesh,material,row,rgba,casts,two)?existing:0;
    return nx_instance_create(d,s,mesh,material,row,rgba,casts,two);
}
nx_handle ng_material_update(nx_handle d,nx_handle s,nx_handle existing,const double* v,nx_handle color,nx_handle normal) {
    // Reuse exactly the ABI1 portable material conversion.
    bridge_error.clear();
    if(!checked_float_values(v,21)||!checked_integer(v[0],0,3)||!checked_integer(v[1],0,2)||!checked_integer(v[10],2,16)||!checked_integer(v[11],0,4))return 0;
    auto m=nx_default_material();m.shading=int(v[0]);m.alpha_mode=int(v[1]);
    for(int i=0;i<3;i++){m.tint[i]=float(v[2+i]);m.shadow_color[i]=float(v[15+i]);m.outline_color[i]=float(v[18+i]);}
    m.roughness=float(v[5]);m.metallic=float(v[6]);m.opacity=float(v[7]);m.alpha_cutoff=float(v[8]);m.normal_strength=float(v[9]);m.bands=int(v[10]);m.outline_pixels=int(v[11]);m.softness=float(v[12]);m.highlight=float(v[13]);m.rim=float(v[14]);m.color_texture=color;m.normal_texture=normal;
    if(existing)return nx_material_update(d,s,existing,&m)?existing:0;
    return nx_material_create(d,s,&m);
}
static thread_local nx_frame frame;
static thread_local std::map<nx_handle,uint64_t> readbacks;
int ng_device_destroy(nx_handle d){bridge_error.clear();const auto ok=nx_device_destroy(d);if(ok)readbacks.erase(d);return ok;}
uintptr_t ng_render(nx_handle d,nx_handle s,int w,int h,int q){bridge_error.clear();return nx_submit(d,s,w,h,q,&frame)?reinterpret_cast<uintptr_t>(&frame):0;}
uintptr_t ng_pixels(uintptr_t p){return reinterpret_cast<uintptr_t>(reinterpret_cast<nx_frame*>(p)->rgba);}
int ng_render_into(nx_handle d,nx_handle s,int w,int h,int q,uint8_t* destination,size_t capacity){
    bridge_error.clear();
    if(w<1||h<1||size_t(w)>SIZE_MAX/size_t(h)/4||!destination||capacity<size_t(w)*size_t(h)*4){bridge_error="Invalid frame destination capacity";return 0;}
    if(!ng_render(d,s,w,h,q))return 0;
    const auto bytes=size_t(w)*size_t(h)*4;std::copy_n(frame.rgba,bytes,destination);readbacks[d]+=bytes;return 1;
}
int ng_statistics(nx_handle d,nx_handle s,double* out){
    bridge_error.clear();nx_statistics a{};a.struct_size=sizeof(a);a.abi_version=2;
    if(!out||!nx_get_statistics(d,s,&a))return 0;
    const uint64_t values[]={a.abi_version,a.scene_revision,a.mesh_uploads,a.uploaded_bytes,a.copied_bytes+readbacks[d],a.validated_vertices,a.transformed_vertices,a.committed_transactions,a.aborted_transactions,a.resident_bytes,a.staging_bytes,a.render_allocations,a.shadow_cache_hits,a.shadow_cache_misses,a.shadow_cache_bypasses,a.shadow_cache_bytes,a.fragment_capacity};
    for(int i=0;i<17;i++)out[i]=double(values[i]);return 1;
}
}
#ifdef NEXUS_NODE
#include <node_api.h>
static napi_value fail(napi_env e,const char* m){napi_throw_error(e,nullptr,m);return nullptr;}
static napi_value invoke(napi_env e,napi_callback_info info){
  try {
    bridge_error.clear();size_t n=12;napi_value a[12];void* opaque=nullptr;napi_get_cb_info(e,info,&n,a,nullptr,&opaque);
    const auto op=reinterpret_cast<intptr_t>(opaque);
    auto num=[&](int i){double v=0;if(size_t(i)>=n||napi_get_value_double(e,a[i],&v)!=napi_ok||!std::isfinite(v))throw std::invalid_argument("Expected finite numeric bridge argument");return v;};
    auto integer=[&](int i,uint64_t max=uint64_t(9007199254740991ULL)){const auto v=num(i);if(v<0||std::floor(v)!=v||v>double(max))throw std::invalid_argument("Expected nonnegative integral bridge argument");return uint64_t(v);};
    auto handle=[&](int i){uint64_t v=0;bool exact=false;if(size_t(i)>=n||napi_get_value_bigint_uint64(e,a[i],&v,&exact)!=napi_ok||!exact)throw std::invalid_argument("Expected integer handle");return v;};
    auto data=[&](int i,napi_typedarray_type expected,size_t minimum)->void*{napi_typedarray_type type;size_t len=0;void* p=nullptr;napi_value b;size_t offset=0;if(size_t(i)>=n||napi_get_typedarray_info(e,a[i],&type,&len,&p,&b,&offset)!=napi_ok||type!=expected||len<minimum)throw std::invalid_argument("Invalid bridge array");return p;};
    napi_value out;uint64_t h=0;int ok=1;bool returnsHandle=false;
    if(op==0){double values[45]{};int kind=int(integer(0,2));ng_defaults(kind,values);void* p;size_t size=kind==0?21:kind==1?45:9;napi_value b;napi_create_arraybuffer(e,size*8,&p,&b);std::copy(values,values+size,static_cast<double*>(p));napi_create_typedarray(e,napi_float64_array,size,b,0,&out);return out;}
    if(op==1){h=nx_device_create();returnsHandle=true;}
    else if(op==2)ok=ng_device_destroy(handle(0));
    else if(op==3){h=nx_scene_create(handle(0));returnsHandle=true;}
    else if(op==4)ok=nx_scene_destroy(handle(0),handle(1));
    else if(op==5){h=ng_material(handle(0),handle(1),static_cast<double*>(data(2,napi_float64_array,21)),handle(3),handle(4));returnsHandle=true;}
    else if(op==6)ok=ng_view(handle(0),handle(1),static_cast<double*>(data(2,napi_float64_array,45)));
    else if(op==7)ok=ng_light(handle(0),handle(1),static_cast<double*>(data(2,napi_float64_array,9)));
    else if(op==8||op==22){const int at=op==8?2:3;const auto w=integer(at,8192),height=integer(at+1,8192);if(!w||!height)throw std::invalid_argument("Invalid texture extent");auto* p=static_cast<uint8_t*>(data(at+2,napi_uint8_array,size_t(w)*height*4));if(op==8)h=nx_texture_create(handle(0),handle(1),int(w),int(height),p,size_t(w)*4,int(integer(at+3,2)),int(integer(at+4,1)));else {h=handle(2);if(!nx_texture_update(handle(0),handle(1),h,int(w),int(height),p,size_t(w)*4,int(integer(at+3,2)),int(integer(at+4,1))))h=0;}returnsHandle=true;}
    else if(op==9){const auto count=integer(3,SIZE_MAX/36);ok=ng_draw(handle(0),handle(1),static_cast<double*>(data(2,napi_float64_array,count*36)),count,unsigned(integer(4,UINT32_MAX)),handle(5),int(integer(6,1)),int(integer(7,1)));}
    else if(op==10)ok=nx_scene_set_background(handle(0),handle(1),uint8_t(integer(2,255)),uint8_t(integer(3,255)),uint8_t(integer(4,255)),uint8_t(integer(5,255)));
    else if(op==11||op==14){const auto w=integer(2,4096),height=integer(3,4096),q=integer(4,2);if(!w||!height)throw std::invalid_argument("Invalid frame extent");void* pixels=nullptr;napi_value b;const size_t size=w*height*4;if(op==11){napi_create_arraybuffer(e,size,&pixels,&b);napi_create_typedarray(e,napi_uint8_clamped_array,size,b,0,&out);}else pixels=data(5,napi_uint8_clamped_array,size);if(!ng_render_into(handle(0),handle(1),int(w),int(height),int(q),static_cast<uint8_t*>(pixels),size))return fail(e,ng_last_error());if(op==11)return out;}
    else if(op==12)ok=nx_device_set_limits(handle(0),integer(1),integer(2));
    else if(op==13)ok=nx_scene_clear_geometry(handle(0),handle(1));
    else if(op==15){napi_create_uint32(e,nx_get_abi_version(),&out);return out;}
    else if(op==16)ok=nx_scene_begin(handle(0),handle(1),handle(2));
    else if(op==17)ok=nx_scene_commit(handle(0),handle(1));
    else if(op==18)ok=nx_scene_abort(handle(0),handle(1));
    else if(op==19){h=nx_scene_revision(handle(0),handle(1));napi_create_bigint_uint64(e,h,&out);return out;}
    else if(op==20){const auto count=integer(4,SIZE_MAX/12),indices=integer(6,SIZE_MAX/4);h=ng_mesh(handle(0),handle(1),handle(2),static_cast<double*>(data(3,napi_float64_array,count*12)),count,static_cast<uint32_t*>(data(5,napi_uint32_array,indices)),indices);returnsHandle=true;}
    else if(op==21){h=ng_instance(handle(0),handle(1),handle(2),handle(3),handle(4),static_cast<double*>(data(5,napi_float64_array,16)),unsigned(integer(6,UINT32_MAX)),int(integer(7,1)),int(integer(8,1)));returnsHandle=true;}
    else if(op==23){h=ng_material_update(handle(0),handle(1),handle(2),static_cast<double*>(data(3,napi_float64_array,21)),handle(4),handle(5));returnsHandle=true;}
    else if(op==24)ok=nx_mesh_release(handle(0),handle(1),handle(2));
    else if(op==25)ok=nx_material_release(handle(0),handle(1),handle(2));
    else if(op==26)ok=nx_texture_release(handle(0),handle(1),handle(2));
    else if(op==27)ok=nx_instance_release(handle(0),handle(1),handle(2));
    else if(op==28){const auto count=integer(3,SIZE_MAX/sizeof(nx_handle));ok=nx_instance_order(handle(0),handle(1),static_cast<nx_handle*>(data(2,napi_biguint64_array,count)),count);}
    else if(op==29){double values[17]{};if(!ng_statistics(handle(0),handle(1),values))return fail(e,ng_last_error());void* p;napi_value b;napi_create_arraybuffer(e,sizeof(values),&p,&b);std::copy_n(values,17,static_cast<double*>(p));napi_create_typedarray(e,napi_float64_array,17,b,0,&out);return out;}
    else if(op==30)ok=nx_device_set_shadow_cache_limit(handle(0),integer(1));
    else return fail(e,"Unknown bridge operation");
    if(!ok||(returnsHandle&&!h))return fail(e,ng_last_error());
    if(returnsHandle)napi_create_bigint_uint64(e,h,&out);else napi_get_boolean(e,true,&out);return out;
  }catch(const std::exception& ex){return fail(e,ex.what());}
}
static napi_value init(napi_env e,napi_value exports){
    const char* names[]={"defaults","deviceCreate","deviceDestroy","sceneCreate","sceneDestroy","material","view","light","texture","draw","background","render","limits","clearGeometry","renderInto","abi","beginUpdate","commitUpdate","abortUpdate","sceneRevision","mesh","instance","textureUpdate","materialResource","releaseMesh","releaseMaterial","releaseTexture","releaseInstance","instanceOrder","statistics","shadowCacheLimit"};
    for(intptr_t i=0;i<31;i++){napi_value fn;napi_create_function(e,names[i],NAPI_AUTO_LENGTH,invoke,reinterpret_cast<void*>(i),&fn);napi_set_named_property(e,exports,names[i],fn);}return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,init)
#endif
