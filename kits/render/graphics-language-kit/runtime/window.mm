#import <AppKit/AppKit.h>
#include <node_api.h>
#include <map>

@interface NexusPixelsView : NSView
@property(nonatomic, strong) NSData* pixels;
@property(nonatomic) int pixelWidth;
@property(nonatomic) int pixelHeight;
@end
@implementation NexusPixelsView
- (BOOL)isFlipped { return YES; }
- (void)drawRect:(NSRect)dirty {
    (void)dirty;
    if (!self.pixels) return;
    CGColorSpaceRef color = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
    CGDataProviderRef data = CGDataProviderCreateWithCFData((__bridge CFDataRef)self.pixels);
    CGImageRef image = CGImageCreate(self.pixelWidth, self.pixelHeight, 8, 32,
        self.pixelWidth * 4, color, kCGImageAlphaLast | kCGBitmapByteOrder32Big,
        data, nullptr, false, kCGRenderingIntentDefault);
    CGContextRef ctx = NSGraphicsContext.currentContext.CGContext;
    CGContextSaveGState(ctx);
    CGContextClearRect(ctx, NSRectToCGRect(self.bounds));
    CGContextTranslateCTM(ctx, 0, self.bounds.size.height);
    CGContextScaleCTM(ctx, 1, -1);
    CGContextDrawImage(ctx, NSRectToCGRect(self.bounds), image);
    CGContextRestoreGState(ctx);
    CGImageRelease(image); CGDataProviderRelease(data); CGColorSpaceRelease(color);
}
@end

namespace {
NSMutableDictionary<NSNumber*, NSWindow*>* windows;
unsigned int serial = 0;
napi_value fail(napi_env env, const char* message) { napi_throw_error(env, nullptr, message); return nullptr; }
napi_value integer(napi_env env, int value) { napi_value result; napi_create_int32(env, value, &result); return result; }
void events() {
    for (int i = 0; i < 64; ++i) {
        NSEvent* event = [NSApp nextEventMatchingMask:NSEventMaskAny untilDate:NSDate.distantPast
            inMode:NSDefaultRunLoopMode dequeue:YES];
        if (!event) break;
        [NSApp sendEvent:event];
    }
    [NSApp updateWindows];
}
napi_value create(napi_env env, napi_callback_info info) {
    @autoreleasepool {
        if (!NSThread.isMainThread) return fail(env, "Native windows require the Node main thread");
        size_t argc = 2; napi_value args[2]; napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
        int32_t width = 640, height = 360;
        if (argc > 0) napi_get_value_int32(env, args[0], &width);
        if (argc > 1) napi_get_value_int32(env, args[1], &height);
        if (width < 1 || height < 1 || width > 4096 || height > 4096) return fail(env, "Invalid native window size");
        [NSApplication sharedApplication];
        [NSApp setActivationPolicy:NSApplicationActivationPolicyRegular];
        [NSApp finishLaunching];
        if (!windows) windows = [NSMutableDictionary new];
        NSWindow* window = [[NSWindow alloc] initWithContentRect:NSMakeRect(0, 0, width, height)
            styleMask:NSWindowStyleMaskTitled | NSWindowStyleMaskClosable | NSWindowStyleMaskMiniaturizable | NSWindowStyleMaskResizable
            backing:NSBackingStoreBuffered defer:NO];
        window.releasedWhenClosed = NO;
        window.opaque = NO; window.backgroundColor = NSColor.clearColor;
        window.title = @"NexusEngine — NexusGL";
        window.contentView = [[NexusPixelsView alloc] initWithFrame:NSMakeRect(0, 0, width, height)];
        [window center]; [window makeKeyAndOrderFront:nil]; [NSApp activateIgnoringOtherApps:YES];
        const auto id = ++serial; windows[@(id)] = window; events();
        return integer(env, int(id));
    }
}
napi_value present(napi_env env, napi_callback_info info) {
    @autoreleasepool {
        size_t argc = 4; napi_value args[4]; napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);
        if (argc != 4 || !NSThread.isMainThread) return fail(env, "Invalid native presentation call");
        uint32_t id; int32_t width, height;
        napi_get_value_uint32(env, args[0], &id); napi_get_value_int32(env, args[2], &width); napi_get_value_int32(env, args[3], &height);
        NSWindow* window = windows[@(id)];
        if (!window || (!window.visible && !window.miniaturized)) return fail(env, "Native window is closed");
        napi_typedarray_type type; size_t count, offset; void* pixels; napi_value buffer;
        if (napi_get_typedarray_info(env, args[1], &type, &count, &pixels, &buffer, &offset) != napi_ok ||
            type != napi_uint8_clamped_array || width < 1 || height < 1 || width > 4096 || height > 4096 ||
            count != size_t(width) * size_t(height) * 4) return fail(env, "Invalid native RGBA pixels");
        auto* view = (NexusPixelsView*)window.contentView;
        view.pixels = [NSData dataWithBytes:pixels length:count];
        view.pixelWidth = width; view.pixelHeight = height;
        [view setNeedsDisplay:YES]; [view displayIfNeeded]; [window displayIfNeeded]; events();
        return integer(env, 1);
    }
}
napi_value pump(napi_env env, napi_callback_info info) {
    @autoreleasepool {
        size_t argc=1; napi_value arg; napi_get_cb_info(env,info,&argc,&arg,nullptr,nullptr);
        uint32_t id=0; if(argc)napi_get_value_uint32(env,arg,&id);
        events(); NSWindow* w=windows[@(id)];
        napi_value result; napi_create_object(env,&result);
        napi_set_named_property(env,result,"width",integer(env,w ? int(w.contentView.bounds.size.width) : 0));
        napi_set_named_property(env,result,"height",integer(env,w ? int(w.contentView.bounds.size.height) : 0));
        napi_set_named_property(env,result,"windowId",integer(env,w ? int(w.windowNumber) : 0));
        napi_value closed; napi_get_boolean(env,!w || (!w.visible && !w.miniaturized),&closed);
        napi_set_named_property(env,result,"closed",closed);
        return result;
    }
}
napi_value close(napi_env env,napi_callback_info info) {
    @autoreleasepool {
        size_t argc=1; napi_value arg; napi_get_cb_info(env,info,&argc,&arg,nullptr,nullptr);
        uint32_t id=0;if(argc)napi_get_value_uint32(env,arg,&id);
        NSWindow* w=windows[@(id)]; if(w){w.contentView=nil;[w close];[windows removeObjectForKey:@(id)];}
        return integer(env,1);
    }
}
napi_value init(napi_env env,napi_value exports) {
    const napi_property_descriptor methods[]={{"create",nullptr,create,nullptr,nullptr,nullptr,napi_default,nullptr},
        {"present",nullptr,present,nullptr,nullptr,nullptr,napi_default,nullptr},
        {"pump",nullptr,pump,nullptr,nullptr,nullptr,napi_default,nullptr},
        {"close",nullptr,close,nullptr,nullptr,nullptr,napi_default,nullptr}};
    napi_define_properties(env,exports,4,methods);return exports;
}
}
NAPI_MODULE(NODE_GYP_MODULE_NAME,init)
