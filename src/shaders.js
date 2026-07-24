function cloneUniforms(uniforms = {}) {
  const out = {};
  for (const [key, value] of Object.entries(uniforms)) {
    out[key] = value && typeof value === "object" && "value" in value
      ? { value: value.value }
      : { value };
  }
  return out;
}

const DEFAULT_VERTEX = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 3) in vec2 aUv;
uniform mat4 uModel;
uniform mat4 uViewProj;
out vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = uViewProj * uModel * vec4(aPosition, 1.0);
}`;

const DEFAULT_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vUv;
uniform vec3 uColor;
uniform float uAlpha;
out vec4 outColor;
void main() {
  outColor = vec4(uColor, uAlpha);
}`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, String(source).trimStart());
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${message}`);
  }
  return shader;
}

function createWebGLProgram(gl, vertexSource, fragmentSource) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource || DEFAULT_VERTEX);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource || DEFAULT_FRAGMENT);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${message}`);
  }
  return program;
}

export function createShaderRegistry(initial = []) {
  const shaders = new Map();

  const registry = {
    register(shader) {
      if (!shader || typeof shader.id !== "string" || shader.id.trim().length === 0) {
        throw new TypeError("Shader descriptors require an id.");
      }

      shaders.set(shader.id, {
        rendererType: "headless",
        uniforms: {},
        vertex: "",
        fragment: "",
        ...shader
      });
      return this.get(shader.id);
    },

    get(id) {
      return shaders.get(id) ?? null;
    },

    list(rendererType) {
      return Array.from(shaders.values()).filter((shader) =>
        !rendererType || shader.rendererType === rendererType || shader.rendererType === "all"
      );
    },

    createProgram(gl, id, uniformOverrides = {}) {
      const shader = this.get(id);
      if (!shader) {
        throw new Error(`Unknown shader: ${id}`);
      }
      if (!gl?.createProgram) {
        throw new TypeError("createProgram requires a WebGL-compatible context.");
      }

      return {
        program: createWebGLProgram(gl, shader.vertex, shader.fragment),
        uniforms: { ...cloneUniforms(shader.uniforms), ...cloneUniforms(uniformOverrides) },
        transparent: shader.transparent ?? false
      };
    }
  };

  for (const shader of initial) {
    registry.register(shader);
  }

  return registry;
}
export function createMaterialRegistry(initial = []) {
  const materials = new Map();

  const registry = {
    register(material) {
      if (!material || typeof material.id !== "string" || material.id.trim().length === 0) {
        throw new TypeError("Material descriptors require an id.");
      }

      materials.set(material.id, { rendererType: "headless", ...material });
      return this.get(material.id);
    },

    get(id) {
      return materials.get(id) ?? null;
    },

    list(rendererType) {
      return Array.from(materials.values()).filter((material) =>
        !rendererType || material.rendererType === rendererType || material.rendererType === "all"
      );
    }
  };

  for (const material of initial) {
    registry.register(material);
  }

  return registry;
}
