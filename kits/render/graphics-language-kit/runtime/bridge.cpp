#include "nexusgl/c_api.h"
#include <array>
#include <vector>
#include <algorithm>
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
    auto m=nx_default_material();m.shading=int(v[0]);m.alpha_mode=int(v[1]);
    for(int i=0;i<3;i++){m.tint[i]=float(v[2+i]);m.shadow_color[i]=float(v[15+i]);m.outline_color[i]=float(v[18+i]);}
    m.roughness=float(v[5]);m.metallic=float(v[6]);m.opacity=float(v[7]);m.alpha_cutoff=float(v[8]);m.normal_strength=float(v[9]);m.bands=int(v[10]);m.outline_pixels=int(v[11]);m.softness=float(v[12]);m.highlight=float(v[13]);m.rim=float(v[14]);m.color_texture=color;m.normal_texture=normal;
    return nx_material_create(d,s,&m);
}
int ng_view(nx_handle d,nx_handle s,const double* v) {
    auto a=nx_default_view();std::copy(v,v+16,a.projection);std::copy(v+16,v+19,a.camera);std::copy(v+19,v+35,a.shadow_projection);std::copy(v+35,v+38,a.light_direction);
    a.shadow_resolution=int(v[38]);a.closed_back_faces=int(v[39]);a.exposure=float(v[40]);a.sample_scale=int(v[41]);a.shadow_bias=v[42];a.receiver_plane_clamp=v[43];a.shadow_filter_radius=int(v[44]);return nx_scene_set_view(d,s,&a);
}
int ng_light(nx_handle d,nx_handle s,const double* v) {
    nx_light a{};std::copy(v,v+3,a.color);a.intensity=v[3];a.fill=v[4];a.sky=v[5];a.sky_gradient=v[6];a.specular=v[7];a.specular_power=v[8];return nx_scene_set_light(d,s,&a);
}
int ng_draw(nx_handle d,nx_handle s,const double* v,size_t count,unsigned color,nx_handle material,int casts,int two) {
    // Upload in bounded batches: the renderer retains copied geometry.
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
        if(!nx_draw_triangles(d,s,triangles.data(),n))return 0;
    }
    return 1;
}
static thread_local nx_frame frame;
uintptr_t ng_render(nx_handle d,nx_handle s,int w,int h,int q) {return nx_submit(d,s,w,h,q,&frame)?reinterpret_cast<uintptr_t>(&frame):0;}
uintptr_t ng_pixels(uintptr_t p) {return reinterpret_cast<uintptr_t>(reinterpret_cast<nx_frame*>(p)->rgba);}
}
#ifdef NEXUS_NODE
#include <node_api.h>
#include <string>
static napi_value fail(napi_env e,const char* m){napi_throw_error(e,nullptr,m);return nullptr;}
static napi_value invoke(napi_env e,napi_callback_info info){
    size_t n=12;napi_value a[12];void* opaque=nullptr;napi_get_cb_info(e,info,&n,a,nullptr,&opaque);
    const auto op=reinterpret_cast<intptr_t>(opaque);
    auto num=[&](int i){double v=0;if(size_t(i)>=n||napi_get_value_double(e,a[i],&v)!=napi_ok)napi_throw_type_error(e,nullptr,"Expected numeric bridge argument");return v;};
    auto handle=[&](int i){uint64_t v=0;bool exact=false;if(size_t(i)>=n||napi_get_value_bigint_uint64(e,a[i],&v,&exact)!=napi_ok||!exact)napi_throw_type_error(e,nullptr,"Expected integer handle");return v;};
    auto data=[&](int i,napi_typedarray_type expected,size_t minimum)->void*{napi_typedarray_type type;size_t len=0;void* p=nullptr;napi_value b;size_t offset=0;if(size_t(i)>=n||napi_get_typedarray_info(e,a[i],&type,&len,&p,&b,&offset)!=napi_ok||type!=expected||len<minimum){napi_throw_type_error(e,nullptr,"Invalid bridge array");return nullptr;}return p;};
    napi_value out;uint64_t h=0;int ok=1;
    if(op==0){double values[45]{};int kind=int(num(0));ng_defaults(kind,values);void* p;size_t size=kind==0?21:kind==1?45:9;napi_value b;napi_create_arraybuffer(e,size*8,&p,&b);std::copy(values,values+size,static_cast<double*>(p));napi_create_typedarray(e,napi_float64_array,size,b,0,&out);return out;}
    if(op==1)h=nx_device_create();
    else if(op==2)ok=nx_device_destroy(handle(0));
    else if(op==3)h=nx_scene_create(handle(0));
    else if(op==4)ok=nx_scene_destroy(handle(0),handle(1));
    else if(op==5){auto* p=static_cast<double*>(data(2,napi_float64_array,21));if(!p)return nullptr;h=ng_material(handle(0),handle(1),p,handle(3),handle(4));}
    else if(op==6){auto* p=static_cast<double*>(data(2,napi_float64_array,45));if(!p)return nullptr;ok=ng_view(handle(0),handle(1),p);}
    else if(op==7){auto* p=static_cast<double*>(data(2,napi_float64_array,9));if(!p)return nullptr;ok=ng_light(handle(0),handle(1),p);}
    else if(op==8){const auto w=int(num(2)),height=int(num(3));if(w<1||height<1)return fail(e,"Invalid texture extent");auto* p=static_cast<uint8_t*>(data(4,napi_uint8_array,size_t(w)*height*4));if(!p)return nullptr;h=nx_texture_create(handle(0),handle(1),w,height,p,size_t(w)*4,int(num(5)),int(num(6)));}
    else if(op==9){const auto count=size_t(num(3));auto* p=static_cast<double*>(data(2,napi_float64_array,count*36));if(!p)return nullptr;ok=ng_draw(handle(0),handle(1),p,count,unsigned(num(4)),handle(5),int(num(6)),int(num(7)));}
    else if(op==10)ok=nx_scene_set_background(handle(0),handle(1),uint8_t(num(2)),uint8_t(num(3)),uint8_t(num(4)),uint8_t(num(5)));
    else if(op==11){const auto w=int(num(2)),height=int(num(3));auto p=ng_render(handle(0),handle(1),w,height,int(num(4)));if(!p)return fail(e,nx_last_error());void* pixels;napi_value b;napi_create_arraybuffer(e,size_t(w)*height*4,&pixels,&b);std::copy(frame.rgba,frame.rgba+size_t(w)*height*4,static_cast<uint8_t*>(pixels));napi_create_typedarray(e,napi_uint8_clamped_array,size_t(w)*height*4,b,0,&out);return out;}
    else if(op==12)ok=nx_device_set_limits(handle(0),uint64_t(num(1)),uint64_t(num(2)));
    else if(op==13)ok=nx_scene_clear_geometry(handle(0),handle(1));
    else return fail(e,"Unknown bridge operation");
    bool pending=false;napi_is_exception_pending(e,&pending);if(pending)return nullptr;
    if(!ok||((op==1||op==3||op==5||op==8)&&!h))return fail(e,nx_last_error());
    if(op==1||op==3||op==5||op==8)napi_create_bigint_uint64(e,h,&out);else napi_get_boolean(e,true,&out);return out;
}
static napi_value init(napi_env e,napi_value exports){
    const char* names[]={"defaults","deviceCreate","deviceDestroy","sceneCreate","sceneDestroy","material","view","light","texture","draw","background","render","limits","clearGeometry"};
    for(intptr_t i=0;i<14;i++){napi_value fn;napi_create_function(e,names[i],NAPI_AUTO_LENGTH,invoke,reinterpret_cast<void*>(i),&fn);napi_set_named_property(e,exports,names[i],fn);}return exports;
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,init)
#endif
