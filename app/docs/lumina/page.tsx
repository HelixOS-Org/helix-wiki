"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import luminaContent from "@/helix-wiki/lib/docs-i18n/lumina";

import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import FileTree from "@/helix-wiki/components/diagrams/FileTree";

export default function LuminaPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(luminaContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title={d("header.title")} subtitle={d("header.subtitle")} badge={d("header.badge")} gradient="from-pink-400 to-rose-500" />

      {/* ── OVERVIEW ── */}
      <Section title={d("section.overview")} id="overview">
        <p>{d("overview.intro")}</p>

        <LayerStack layers={[
          { label: "Application Layer (scene, UI, compositing)", detail: "App", color: "pink",
            description: "Top-level application layer providing scene graph management, UI compositing, and window integration for desktop rendering.",
            info: { components: ["Scene Graph", "UI Compositor", "Window Manager"], metrics: [{ label: "API", value: "High-level", color: "#EC4899" }, { label: "Widgets", value: "20+" }], api: ["create_window()", "render_scene()", "composite_ui()"], status: "active" } },
          { label: "Render Pipeline (lumina-pipeline, lumina-render)", detail: "Rendering", color: "rose",
            description: "Multi-pass render pipeline with configurable render passes, render targets, and GPU command queue management for optimal batching and frame scheduling.",
            info: { components: ["lumina-pipeline", "lumina-render", "Command Queue"], metrics: [{ label: "Passes", value: "Multi", color: "#F43F5E" }, { label: "Batch", value: "Oui" }], api: ["begin_pass()", "submit_queue()", "present()"], status: "active" } },
          { label: "Material & Mesh (lumina-material, lumina-mesh)", detail: "Assets", color: "purple",
            description: "Asset management for PBR materials, textures, and geometry. Handles mesh LOD, texture atlas packing, vertex/index buffer management and GPU upload.",
            info: { components: ["lumina-material", "lumina-mesh", "Texture Atlas"], metrics: [{ label: "PBR", value: "Oui", color: "#7B68EE" }, { label: "LOD", value: "Auto" }], api: ["load_mesh()", "bind_material()", "upload_texture()"], status: "active" } },
          { label: "Shader Compiler (lumina-shader → lumina-ir → lumina-spirv)", detail: "Compilation", color: "blue",
            description: "Multi-stage shader compiler: source → IR → SPIR-V with runtime reflection for automatic uniform binding and pipeline layout generation.",
            info: { components: ["lumina-shader", "lumina-ir", "lumina-spirv"], metrics: [{ label: "Target", value: "SPIR-V", color: "#4A90E2" }, { label: "Stages", value: "3" }], api: ["compile_shader()", "emit_spirv()", "reflect_uniforms()"], status: "active" } },
          { label: "GPU Abstraction (lumina-backend, lumina-sync)", detail: "Backend", color: "cyan",
            description: "Hardware abstraction over GPU backends with synchronization primitives. Provides a unified command buffer API regardless of the underlying graphics driver.",
            info: { components: ["lumina-backend", "lumina-sync", "Fence/Semaphore"], metrics: [{ label: "Backends", value: "Multi", color: "#22D3EE" }, { label: "Sync", value: "Oui" }], api: ["create_buffer()", "create_image()", "wait_fence()"], status: "active" } },
          { label: "Core Types (lumina-core, lumina-math)", detail: "Foundation", color: "amber",
            description: "Foundation math library with SIMD-optimized vectors, matrices, quaternions, colors, and geometric primitives used throughout the rendering stack.",
            info: { components: ["lumina-core", "lumina-math", "SIMD Engine"], metrics: [{ label: "SIMD", value: "Oui", color: "#F59E0B" }, { label: "Types", value: "12+" }], api: ["Vec3::new()", "Mat4::perspective()", "Color::rgba()"], status: "active" } },
          { label: "Memory (lumina-memory) + Debug (lumina-debug)", detail: "Infrastructure", color: "zinc",
            description: "Custom GPU memory allocator with sub-allocation pools, frame-based staging, and integrated GPU profiler for performance monitoring and leak detection.",
            info: { components: ["lumina-memory", "lumina-debug", "GPU Profiler"], metrics: [{ label: "Alloc", value: "Pool" }, { label: "Profile", value: "GPU" }], api: ["gpu_alloc()", "begin_profile()", "track_leak()"], status: "passive" } },
          { label: "Magma GPU Driver (magma-core, magma-hal, magma-command)", detail: "Hardware", color: "green",
            description: "Kernel-level GPU driver providing ring buffer command submission, MMIO register access, and IRQ handling for direct GPU hardware communication.",
            info: { components: ["magma-core", "magma-hal", "magma-command"], metrics: [{ label: "Ring", value: "CMD", color: "#22C55E" }, { label: "DMA", value: "Oui" }], api: ["ring_submit()", "mmio_read()", "irq_register()"], status: "active" } },
        ]} />
      </Section>

      {/* ── SUB-CRATES ── */}
      <Section title={d("section.inventory")} id="crates">
        <p>{d("inventory.intro")}</p>
        <InfoTable
          columns={[
            { header: "Crate", key: "crate" },
            { header: "Purpose", key: "purpose" },
            { header: "Key Types", key: "types" },
          ]}
          rows={[
            { crate: "lumina-core", purpose: "Handle system, resource lifecycle, type IDs", types: "Handle<T>, ResourceId, TypeId, Pool<T>" },
            { crate: "lumina-math", purpose: "Linear algebra, transforms, geometry", types: "Vec2/3/4, Mat3/4, Quat, AABB, Frustum" },
            { crate: "lumina-shader", purpose: "Shader source parsing, compilation", types: "ShaderSource, ShaderStage, CompileOptions" },
            { crate: "lumina-ir", purpose: "Intermediate representation for shaders", types: "IrModule, IrInstruction, IrType, IrBlock" },
            { crate: "lumina-spirv", purpose: "SPIR-V bytecode generation", types: "SpirVModule, SpirVBuilder, SpirVValidator" },
            { crate: "lumina-macros", purpose: "Procedural macros for shader/pipeline", types: "#[shader], #[vertex], #[uniform]" },
            { crate: "lumina-render", purpose: "Render graph, frame management", types: "RenderGraph, RenderPass, FrameContext" },
            { crate: "lumina-pipeline", purpose: "Graphics/compute pipeline state", types: "GraphicsPipeline, ComputePipeline, PipelineLayout" },
            { crate: "lumina-material", purpose: "PBR materials, textures, samplers", types: "Material, Texture, Sampler, MaterialInstance" },
            { crate: "lumina-mesh", purpose: "Vertex buffers, index buffers, mesh data", types: "Mesh, VertexFormat, IndexBuffer, MeshBuilder" },
            { crate: "lumina-backend", purpose: "GPU backend abstraction layer", types: "GpuDevice, GpuQueue, GpuBackend, Surface" },
            { crate: "lumina-sync", purpose: "GPU synchronization primitives", types: "Fence, Semaphore, Barrier, TimelineSemaphore" },
            { crate: "lumina-memory", purpose: "GPU memory allocation, suballocation", types: "GpuAllocator, MemoryBlock, MemoryType" },
            { crate: "lumina-debug", purpose: "GPU debug markers, validation layers", types: "DebugMessenger, DebugLabel, ValidationLayer" },
          ]}
        />
      </Section>

      {/* ── CORE ── */}
      <Section title={d("section.handles")} id="handles">
        <p>{d("handles.intro")}</p>
        <RustCode filename="graphics/lumina/lumina-core/src/lib.rs">{`/// 64-bit generational handle:
/// [  32-bit index  |  32-bit generation  ]
pub struct Handle<T> {
    index: u32,
    generation: u32,
    _marker: PhantomData<T>,
}

pub struct Pool<T> {
    entries: Vec<PoolEntry<T>>,
    generations: Vec<u32>,
    free_list: Vec<u32>,
    count: usize,
}

struct PoolEntry<T> {
    value: Option<T>,
    generation: u32,
}

impl<T> Pool<T> {
    pub fn new() -> Self;

    /// Allocate a new entry, returns a handle.
    pub fn insert(&mut self, value: T) -> Handle<T>;

    /// Get a reference — returns None if handle is stale.
    pub fn get(&self, handle: Handle<T>) -> Option<&T>;

    /// Get a mutable reference.
    pub fn get_mut(&mut self, handle: Handle<T>) -> Option<&mut T>;

    /// Free the entry — increments generation, invalidating handle.
    pub fn remove(&mut self, handle: Handle<T>) -> Option<T>;

    /// Is this handle still valid?
    pub fn is_valid(&self, handle: Handle<T>) -> bool;

    pub fn len(&self) -> usize;
}

// Why handles:
// - No use-after-free: stale handles return None
// - No double-free: generation check prevents it
// - Cache-friendly: dense Vec storage
// - 8 bytes: smaller than Arc<T> (16 bytes + heap)`}</RustCode>
      </Section>

      {/* ── MATH ── */}
      <Section title={d("section.math")} id="math">
        <p>{d("math.intro")}</p>
        <RustCode filename="graphics/lumina/lumina-math/src/lib.rs">{`#[repr(C)]
pub struct Vec2 { pub x: f32, pub y: f32 }

#[repr(C)]
pub struct Vec3 { pub x: f32, pub y: f32, pub z: f32 }

#[repr(C)]
pub struct Vec4 { pub x: f32, pub y: f32, pub z: f32, pub w: f32 }

#[repr(C)]
pub struct Mat3 { pub cols: [Vec3; 3] }

#[repr(C)]
pub struct Mat4 { pub cols: [Vec4; 4] }

#[repr(C)]
pub struct Quat { pub x: f32, pub y: f32, pub z: f32, pub w: f32 }

// ── Geometric primitives ──
pub struct AABB { pub min: Vec3, pub max: Vec3 }
pub struct Sphere { pub center: Vec3, pub radius: f32 }
pub struct Ray { pub origin: Vec3, pub direction: Vec3 }
pub struct Plane { pub normal: Vec3, pub distance: f32 }
pub struct Frustum { pub planes: [Plane; 6] }

// ── Transform ──
pub struct Transform {
    pub position: Vec3,
    pub rotation: Quat,
    pub scale: Vec3,
}

impl Transform {
    pub fn to_matrix(&self) -> Mat4;
    pub fn from_matrix(m: &Mat4) -> Self;
    pub fn look_at(eye: Vec3, target: Vec3, up: Vec3) -> Mat4;
    pub fn perspective(fov: f32, aspect: f32, near: f32, far: f32) -> Mat4;
    pub fn orthographic(l: f32, r: f32, b: f32, t: f32, n: f32, f: f32) -> Mat4;
}`}</RustCode>
      </Section>

      {/* ── PIPELINE ── */}
      <Section title={d("section.pipeline")} id="pipeline">
        <p>{d("pipeline.intro")}</p>
        <RustCode filename="graphics/lumina/lumina-pipeline/src/lib.rs">{`pub struct GraphicsPipeline {
    pub vertex_input: VertexInputState,
    pub input_assembly: InputAssemblyState,
    pub rasterizer: RasterizerState,
    pub multisample: MultisampleState,
    pub depth_stencil: DepthStencilState,
    pub color_blend: ColorBlendState,
    pub layout: PipelineLayout,
    pub shaders: ShaderStages,
}

pub struct VertexInputState {
    pub bindings: Vec<VertexBinding>,
    pub attributes: Vec<VertexAttribute>,
}

pub struct VertexBinding {
    pub binding: u32,
    pub stride: u32,
    pub input_rate: VertexInputRate,
}

pub enum VertexInputRate { Vertex, Instance }

pub struct VertexAttribute {
    pub location: u32,
    pub binding: u32,
    pub format: VertexFormat,
    pub offset: u32,
}

pub enum VertexFormat {
    Float,    Float2,   Float3,   Float4,
    Int,      Int2,     Int3,     Int4,
    UInt,     UInt2,    UInt3,    UInt4,
    Byte4Norm,
}

pub struct RasterizerState {
    pub polygon_mode: PolygonMode,  // Fill, Line, Point
    pub cull_mode: CullMode,        // None, Front, Back, Both
    pub front_face: FrontFace,      // CW, CCW
    pub depth_bias: Option<DepthBias>,
    pub line_width: f32,
}

pub struct DepthStencilState {
    pub depth_test: bool,
    pub depth_write: bool,
    pub depth_compare: CompareOp,   // Less, LessEqual, Greater...
    pub stencil_test: bool,
    pub stencil_front: StencilOps,
    pub stencil_back: StencilOps,
}

pub struct PipelineLayout {
    pub descriptor_sets: Vec<DescriptorSetLayout>,
    pub push_constants: Vec<PushConstantRange>,
}

impl GraphicsPipeline {
    pub fn builder() -> GraphicsPipelineBuilder;
}

// ── Compute Pipeline ──
pub struct ComputePipeline {
    pub shader: ShaderModule,
    pub layout: PipelineLayout,
    pub work_group_size: [u32; 3],
}`}</RustCode>
      </Section>

      {/* ── RENDER GRAPH ── */}
      <Section title={d("section.rendergraph")} id="rendergraph">
        <p>{d("rendergraph.intro")}</p>
        <RustCode filename="graphics/lumina/lumina-render/src/graph.rs">{`pub struct RenderGraph {
    passes: Vec<RenderPass>,
    resources: Vec<GraphResource>,
    edges: Vec<(usize, usize)>,   // Dependency edges
    compiled: Option<CompiledGraph>,
}

pub struct RenderPass {
    pub name: &'static str,
    pub inputs: Vec<ResourceRef>,    // Read dependencies
    pub outputs: Vec<ResourceRef>,   // Write outputs
    pub execute: Box<dyn FnMut(&mut RenderContext)>,
    pub pass_type: PassType,
}

pub enum PassType {
    Graphics,
    Compute,
    Transfer,
    Present,
}

pub struct GraphResource {
    pub name: &'static str,
    pub resource_type: ResourceType,
    pub size: (u32, u32),
    pub format: TextureFormat,
    pub lifetime: ResourceLifetime,
}

pub enum ResourceLifetime {
    Transient,      // Allocated per-frame, released after
    Persistent,     // Lives across frames
    Imported,       // External resource (e.g., swapchain image)
}

impl RenderGraph {
    pub fn new() -> Self;

    /// Add a render pass.
    pub fn add_pass(&mut self, pass: RenderPass) -> PassId;

    /// Declare a transient resource.
    pub fn create_resource(&mut self, desc: GraphResource) -> ResourceRef;

    /// Compile — topological sort, barrier insertion, aliasing.
    pub fn compile(&mut self) -> Result<(), GraphError>;

    /// Execute all passes in dependency order.
    pub fn execute(&mut self, ctx: &mut RenderContext) -> Result<(), GraphError>;

    /// Reset for next frame.
    pub fn reset(&mut self);
}

// Compilation does:
// 1. Topological sort of passes
// 2. Resource lifetime analysis
// 3. Automatic barrier/transition insertion
// 4. Memory aliasing for transient resources
// 5. Dead pass elimination`}</RustCode>
      </Section>

      {/* ── SHADERS ── */}
      <Section title={d("section.shaders")} id="shaders">
        <p>{d("shaders.intro")}</p>
        <RustCode filename="graphics/lumina/lumina-shader/src/lib.rs">{`pub struct ShaderSource {
    pub source: String,
    pub stage: ShaderStage,
    pub entry_point: String,
    pub defines: Vec<(String, String)>,
}

pub enum ShaderStage {
    Vertex,
    Fragment,
    Compute,
    Geometry,
    TessControl,
    TessEvaluation,
}

pub struct ShaderModule {
    pub spirv: Vec<u32>,          // SPIR-V bytecode
    pub stage: ShaderStage,
    pub entry_point: String,
    pub reflection: ShaderReflection,
}

pub struct ShaderReflection {
    pub inputs: Vec<ShaderInput>,
    pub outputs: Vec<ShaderOutput>,
    pub uniforms: Vec<UniformBinding>,
    pub push_constants: Option<PushConstantLayout>,
    pub work_group_size: Option<[u32; 3]>,
}

pub struct ShaderCompiler {
    options: CompileOptions,
}

impl ShaderCompiler {
    pub fn new() -> Self;

    /// Full pipeline: source → IR → optimize → SPIR-V
    pub fn compile(&self, source: &ShaderSource)
        -> Result<ShaderModule, CompileError>;

    /// Source → IR only
    pub fn parse_to_ir(&self, source: &ShaderSource)
        -> Result<IrModule, CompileError>;

    /// IR → optimized IR
    pub fn optimize(&self, module: &mut IrModule);

    /// IR → SPIR-V
    pub fn emit_spirv(&self, module: &IrModule)
        -> Result<Vec<u32>, CompileError>;
}`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Intermediate Representation</h3>
        <RustCode filename="graphics/lumina/lumina-ir/src/lib.rs">{`pub struct IrModule {
    pub functions: Vec<IrFunction>,
    pub globals: Vec<IrGlobal>,
    pub types: Vec<IrType>,
    pub entry_points: Vec<EntryPoint>,
}

pub struct IrFunction {
    pub name: String,
    pub return_type: IrTypeId,
    pub params: Vec<IrParam>,
    pub blocks: Vec<IrBlock>,
}

pub struct IrBlock {
    pub label: String,
    pub instructions: Vec<IrInstruction>,
    pub terminator: Terminator,
}

pub enum IrInstruction {
    // ── Arithmetic ──
    Add(IrValue, IrValue, IrValue),
    Sub(IrValue, IrValue, IrValue),
    Mul(IrValue, IrValue, IrValue),
    Div(IrValue, IrValue, IrValue),

    // ── Vector/Matrix ──
    Dot(IrValue, IrValue, IrValue),
    Cross(IrValue, IrValue, IrValue),
    MatMul(IrValue, IrValue, IrValue),
    Normalize(IrValue, IrValue),

    // ── Memory ──
    Load(IrValue, IrValue),
    Store(IrValue, IrValue),

    // ── Texture ──
    Sample(IrValue, IrValue, IrValue),
    SampleLod(IrValue, IrValue, IrValue, IrValue),

    // ── Comparison ──
    CmpEq(IrValue, IrValue, IrValue),
    CmpLt(IrValue, IrValue, IrValue),

    // ── Conversion ──
    Cast(IrValue, IrValue, IrTypeId),
    Phi(IrValue, Vec<(IrValue, String)>),
}

pub enum IrType {
    Void,
    Bool,
    Int(u32),
    UInt(u32),
    Float(u32),
    Vector(Box<IrType>, u32),
    Matrix(Box<IrType>, u32, u32),
    Struct(Vec<(String, IrType)>),
    Array(Box<IrType>, u32),
    Sampler,
    Texture(TextureDimension),
}`}</RustCode>
      </Section>

      {/* ── MAGMA ── */}
      <Section title={d("section.magma")} id="magma">
        <p>{d("magma.intro")}</p>
        <InfoTable
          columns={[
            { header: "Crate", key: "crate" },
            { header: "Purpose", key: "purpose" },
            { header: "Key Types", key: "types" },
          ]}
          rows={[
            { crate: "magma-core", purpose: "Device discovery, initialization, feature queries", types: "GpuDevice, DeviceInfo, GpuFeatures, GpuLimits" },
            { crate: "magma-hal", purpose: "Hardware abstraction for GPU registers, MMIO", types: "MmioRegion, RegisterBank, PciConfig, Bar" },
            { crate: "magma-command", purpose: "Command buffer recording and submission", types: "CommandBuffer, CommandPool, SubmitInfo, QueueFamily" },
            { crate: "magma-gl", purpose: "OpenGL-like compatibility layer", types: "GlContext, GlTexture, GlBuffer, GlProgram" },
          ]}
        />
        <RustCode filename="drivers/gpu/magma/magma-core/src/lib.rs">{`pub struct GpuDevice {
    pub vendor_id: u16,
    pub device_id: u16,
    pub device_name: String,
    pub driver_version: u32,
    pub features: GpuFeatures,
    pub limits: GpuLimits,
    pub queue_families: Vec<QueueFamily>,
    pub memory_types: Vec<MemoryType>,
}

pub struct GpuFeatures {
    pub geometry_shader: bool,
    pub tessellation: bool,
    pub compute_shader: bool,
    pub multi_draw_indirect: bool,
    pub texture_compression_bc: bool,
    pub depth_clamp: bool,
    pub fill_mode_wireframe: bool,
    pub sampler_anisotropy: bool,
    pub max_anisotropy: f32,
}

pub struct GpuLimits {
    pub max_texture_size: u32,
    pub max_framebuffer_size: (u32, u32),
    pub max_viewports: u32,
    pub max_vertex_attributes: u32,
    pub max_descriptor_sets: u32,
    pub max_push_constant_size: u32,
    pub max_compute_work_group_size: [u32; 3],
    pub max_compute_work_groups: [u32; 3],
    pub max_memory_allocation_size: u64,
    pub buffer_alignment: u64,
}

impl GpuDevice {
    /// Enumerate all GPUs in the system.
    pub fn enumerate() -> Vec<GpuDevice>;

    /// Create a logical device with requested features.
    pub fn create(physical: &GpuDevice, features: &GpuFeatures)
        -> Result<Self, GpuError>;

    /// Get a queue of the specified family.
    pub fn get_queue(&self, family: u32, index: u32)
        -> Result<GpuQueue, GpuError>;

    /// Wait for all GPU operations to complete.
    pub fn wait_idle(&self) -> Result<(), GpuError>;
}`}</RustCode>
      </Section>

      {/* ── SYNC ── */}
      <Section title={d("section.sync")} id="sync">
        <p>GPU synchronization primitives for CPU-GPU and GPU-GPU coordination:</p>
        <RustCode filename="graphics/lumina/lumina-sync/src/lib.rs">{`/// CPU-GPU synchronization. Signal from GPU, wait on CPU.
pub struct Fence {
    signaled: AtomicBool,
    device: Handle<GpuDevice>,
}

impl Fence {
    pub fn new(device: Handle<GpuDevice>, signaled: bool) -> Self;
    pub fn wait(&self, timeout_ns: u64) -> Result<(), SyncError>;
    pub fn is_signaled(&self) -> bool;
    pub fn reset(&self);
}

/// GPU-GPU synchronization between queue submissions.
pub struct Semaphore {
    device: Handle<GpuDevice>,
}

/// Timeline semaphore — monotonic counter, more flexible than binary.
pub struct TimelineSemaphore {
    device: Handle<GpuDevice>,
    value: AtomicU64,
}

impl TimelineSemaphore {
    pub fn new(device: Handle<GpuDevice>, initial: u64) -> Self;
    pub fn signal(&self, value: u64);
    pub fn wait(&self, value: u64, timeout_ns: u64) -> Result<(), SyncError>;
    pub fn get_value(&self) -> u64;
}

/// Pipeline barrier for resource state transitions.
pub struct Barrier {
    pub src_stage: PipelineStage,
    pub dst_stage: PipelineStage,
    pub src_access: AccessFlags,
    pub dst_access: AccessFlags,
}

bitflags! {
    pub struct PipelineStage: u32 {
        const TOP           = 1 << 0;
        const VERTEX_INPUT  = 1 << 1;
        const VERTEX_SHADER = 1 << 2;
        const FRAGMENT      = 1 << 3;
        const EARLY_DEPTH   = 1 << 4;
        const LATE_DEPTH    = 1 << 5;
        const COLOR_OUTPUT  = 1 << 6;
        const COMPUTE       = 1 << 7;
        const TRANSFER      = 1 << 8;
        const BOTTOM        = 1 << 9;
    }
}`}</RustCode>
      </Section>

      {/* ── SCALE ── */}
      <Section title={d("section.scale")} id="scale">
        <div className="mt-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-5">
          <p className="text-lg font-semibold text-white mb-1">197,473 lines · 282 files · 14 sub-crates + Magma driver</p>
          <p className="text-sm text-zinc-400">Lumina is built entirely in <code className="text-helix-blue">no_std</code> Rust. It includes its own math library, shader compiler, IR optimizer, SPIR-V emitter, render graph, and GPU driver — with zero external graphics dependencies.</p>
        </div>
        <FileTree title="graphics/lumina/ + drivers/gpu/magma/" tree={[
          { name: "graphics/lumina", icon: "folder",
            info: { loc: 185000, description: "Complete GPU graphics stack: 14 sub-crates covering math, shaders, rendering, materials, and GPU abstraction — all in no_std Rust.", status: "stable" },
            children: [
            { name: "lumina-core", icon: "folder", detail: "Handles, pools, resource IDs",
              info: { loc: 4200, description: "Foundation types: handles, resource pools, typed IDs, and smart pointers for GPU resource lifetime management.", status: "stable", exports: ["Handle", "ResourcePool", "TypedId", "SlotMap"] } },
            { name: "lumina-math", icon: "folder", detail: "Vec2/3/4, Mat3/4, Quat, AABB, Frustum",
              info: { loc: 8500, description: "SIMD-optimized math library: vectors, matrices, quaternions, AABB, frustum culling, ray intersection, and geometric transforms.", status: "stable", exports: ["Vec2", "Vec3", "Vec4", "Mat3", "Mat4", "Quat", "AABB", "Frustum"] } },
            { name: "lumina-shader", icon: "folder", detail: "Shader source parsing",
              info: { loc: 12000, description: "Shader language parser and AST: lexer, parser, type checker, and semantic analysis for the Lumina shading language.", status: "stable", exports: ["ShaderSource", "ShaderAST", "TypeChecker"] } },
            { name: "lumina-ir", icon: "folder", detail: "Intermediate representation",
              info: { loc: 15000, description: "Shader IR with SSA form: optimization passes (dead code elimination, constant folding, loop unrolling) before SPIR-V emission.", status: "stable", exports: ["IR", "IRModule", "OptPass", "SSABuilder"] } },
            { name: "lumina-spirv", icon: "folder", detail: "SPIR-V bytecode generation",
              info: { loc: 11000, description: "SPIR-V backend: translates optimized IR to SPIR-V bytecode with reflection metadata for automatic descriptor set layout.", status: "stable", exports: ["SpirvEmitter", "SpirvModule", "ReflectionData"] } },
            { name: "lumina-macros", icon: "folder", detail: "#[shader], #[vertex], #[uniform]",
              info: { loc: 3500, description: "Procedural macros for shader development: #[shader] for entry points, #[vertex] for layout derivation, #[uniform] for binding generation.", status: "stable", exports: ["#[shader]", "#[vertex]", "#[uniform]", "#[push_constant]"] } },
            { name: "lumina-render", icon: "folder", detail: "Render graph, frame context",
              info: { loc: 18000, description: "Render graph system: automatic resource barriers, pass scheduling, transient resource allocation, and frame-level resource management.", status: "stable", exports: ["RenderGraph", "RenderPass", "FrameContext", "TransientBuffer"] } },
            { name: "lumina-pipeline", icon: "folder", detail: "Graphics/Compute pipeline state",
              info: { loc: 9500, description: "Pipeline state objects: graphics pipeline (rasterization, blend, depth), compute pipeline, and pipeline cache with hash-based deduplication.", status: "stable", exports: ["GraphicsPipeline", "ComputePipeline", "PipelineCache"] } },
            { name: "lumina-material", icon: "folder", detail: "PBR materials, textures, samplers",
              info: { loc: 7800, description: "PBR material system: metallic-roughness workflow, texture binding, sampler configuration, and material instance instancing.", status: "stable", exports: ["Material", "Texture", "Sampler", "PBRParams"] } },
            { name: "lumina-mesh", icon: "folder", detail: "Vertex/Index buffers, mesh data",
              info: { loc: 6200, description: "Mesh management: vertex/index buffer allocation, vertex format declaration, mesh LOD generation, and draw call batching.", status: "stable", exports: ["Mesh", "VertexBuffer", "IndexBuffer", "MeshLOD"] } },
            { name: "lumina-backend", icon: "folder", detail: "GPU device abstraction",
              info: { loc: 22000, description: "GPU backend abstraction: unified API over Vulkan/Metal/DX12 with automatic command buffer management and resource state tracking.", status: "stable", exports: ["Device", "CommandBuffer", "Queue", "Swapchain"] } },
            { name: "lumina-sync", icon: "folder", detail: "Fence, Semaphore, Barrier",
              info: { loc: 4500, description: "GPU synchronization primitives: timeline semaphores, binary fences, pipeline barriers, and execution dependency tracking.", status: "stable", exports: ["Fence", "Semaphore", "Barrier", "TimelineSemaphore"] } },
            { name: "lumina-memory", icon: "folder", detail: "GPU allocator, suballocation",
              info: { loc: 8000, description: "GPU memory allocator: buddy allocation, pool sub-allocation, staging buffer management, and defragmentation for GPU heaps.", status: "stable", exports: ["GpuAllocator", "MemoryPool", "StagingBuffer"] } },
            { name: "lumina-debug", icon: "folder", detail: "Debug markers, validation",
              info: { loc: 3200, description: "Debug and profiling: GPU debug markers, validation layer integration, render doc capture, and performance counters.", status: "stable", exports: ["DebugMarker", "ValidationLayer", "GpuProfiler"] } },
          ]},
          { name: "drivers/gpu/magma", icon: "folder",
            info: { loc: 12500, description: "Kernel-level GPU driver: direct hardware access via MMIO, ring buffer command submission, DMA transfers, and interrupt handling.", status: "stable" },
            children: [
            { name: "magma-core", icon: "folder", detail: "Device discovery, features, limits",
              info: { loc: 4000, description: "GPU device discovery: PCI enumeration, feature/limit queries, device initialization, and multi-GPU support.", status: "stable", exports: ["GpuDevice", "DeviceFeatures", "DeviceLimits"] } },
            { name: "magma-hal", icon: "folder", detail: "MMIO, register banks, PCI",
              info: { loc: 4500, description: "Hardware abstraction: MMIO register access, PCI config space, BAR mapping, and register bank definitions for GPU families.", status: "stable", exports: ["MmioRegion", "PciConfig", "RegisterBank"] } },
            { name: "magma-command", icon: "folder", detail: "Command buffers, submission",
              info: { loc: 3000, description: "GPU command infrastructure: ring buffer management, command encoding, batch submission, and completion tracking via interrupts.", status: "stable", exports: ["CommandRing", "CommandEncoder", "SubmitBatch"] } },
            { name: "magma-gl", icon: "folder", detail: "OpenGL compatibility layer",
              info: { loc: 1000, description: "OpenGL compatibility shim: translates legacy GL calls to Magma's native command interface for backward compatibility.", status: "wip", exports: ["GlContext", "GlCompat"] } },
          ]},
        ]} />
      </Section>

    </div>
  );
}
