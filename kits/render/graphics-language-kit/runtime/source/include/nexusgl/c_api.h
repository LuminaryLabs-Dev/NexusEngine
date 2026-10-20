#ifndef NEXUSGL_C_API_H
#define NEXUSGL_C_API_H
#include <stddef.h>
#include <stdint.h>
#ifdef __cplusplus
extern "C" {
#endif
/* Version 1, synchronous CPU submissions. All handles are checked integers.
 * A scene owns its material/texture resources until scene or device destruction.
 * Returned RGBA pixels expire on the next submission attempt, trim or destruction.
 * The caller owns all input memory; successful uploads copy it. */
typedef uint64_t nx_handle;
typedef struct nx_vertex {
    double position[3], normal[3], uv[2], tangent[3], handedness;
} nx_vertex;
typedef struct nx_triangle {
    nx_vertex vertices[3];
    uint8_t color[4];
    nx_handle material;
    int casts_shadow, two_sided_shadow;
} nx_triangle;
typedef struct nx_material {
    int shading, alpha_mode; /* Reference/Toon/PBR/Unlit; Opaque/Mask/Blend: 0 onward. */
    float tint[3], roughness, metallic, opacity, alpha_cutoff, normal_strength;
    nx_handle color_texture, normal_texture;
    int bands, outline_pixels;
    float softness, highlight, rim, shadow_color[3], outline_color[3];
} nx_material;
typedef struct nx_view {
    double projection[16], camera[3], shadow_projection[16], light_direction[3];
    int shadow_resolution, closed_back_faces;
    float exposure;
    int sample_scale;
    double shadow_bias, receiver_plane_clamp;
    int shadow_filter_radius;
} nx_view;
typedef struct nx_light {
    double color[3], intensity, fill, sky, sky_gradient, specular, specular_power;
} nx_light;
typedef struct nx_frame {
    const uint8_t* rgba;
    int width, height;
    size_t stride;
    uint64_t serial;
} nx_frame;
typedef struct nx_capabilities {
    unsigned abi_version;
    int software, gpu, alpha_blend, alpha_mask, mipmaps, supersampling, max_dimension;
    uint64_t max_pixels, max_guided_pixels, max_fragments, default_budget_bytes;
} nx_capabilities;
nx_capabilities nx_get_capabilities(void);
nx_material nx_default_material(void);
nx_view nx_default_view(void);
nx_light nx_default_light(void);
const char* nx_last_error(void); /* Calling thread's last failed operation. */
nx_handle nx_device_create(void);
int nx_device_destroy(nx_handle device);
int nx_device_set_limits(nx_handle device, uint64_t bytes, uint64_t fragments);
int nx_device_trim(nx_handle device);
nx_handle nx_scene_create(nx_handle device);
int nx_scene_destroy(nx_handle device, nx_handle scene);
int nx_scene_set_light(nx_handle device, nx_handle scene, const nx_light* light);
int nx_scene_set_view(nx_handle device, nx_handle scene, const nx_view* view);
int nx_scene_set_background(nx_handle device, nx_handle scene, uint8_t r, uint8_t g, uint8_t b,
                            uint8_t a);
int nx_scene_clear_geometry(nx_handle device, nx_handle scene);
nx_handle nx_texture_create(nx_handle device, nx_handle scene, int width, int height,
                            const uint8_t* rgba, size_t stride, int filter, int normal_map);
nx_handle nx_material_create(nx_handle device, nx_handle scene, const nx_material* material);
int nx_draw_triangles(nx_handle device, nx_handle scene, const nx_triangle* triangles,
                      size_t count);
int nx_submit(nx_handle device, nx_handle scene, int width, int height, int quality,
              nx_frame* frame);
#ifdef __cplusplus
}
#endif
#endif
