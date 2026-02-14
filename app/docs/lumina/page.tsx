import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "Lumina — Vulkan-Class GPU API: Render Graphs, Shaders & Magma Driver",
  description: "Lumina: a Vulkan-inspired GPU abstraction for Helix OS. 350K lines covering render graphs, GLSL/HLSL→SPIR-V shader compilation, PBR materials, type-safe handles, and the Magma GPU driver.",
  alternates: { canonical: "/docs/lumina" },
  openGraph: {
    title: "Lumina GPU API — Graphics Pipeline for Helix OS",
    description: "8 sub-crates: core math, render pipeline builder, DAG-based render graph scheduling, shader reflection, GPU synchronization primitives, and the low-level Magma command buffer driver.",
    url: "https://helix-wiki.com/docs/lumina",
  },
};
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import FileTree from "@/helix-wiki/components/diagrams/FileTree";

export default function LuminaPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="Lumina" subtitle="197,473 lines across 282 files — the Helix GPU-accelerated graphics stack. 14 sub-crates covering math, shaders, render pipeline, materials, meshes, and synchronization. Includes the Magma GPU driver (17,664 lines)." badge="GRAPHICS" gradient="from-pink-400 to-rose-500" />

      {/* ── OVERVIEW ── */}
      <Section title="Architecture Overview" id="overview">
        <p>Lumina is a complete GPU graphics stack built from scratch in <code className="text-helix-blue">no_std</code> Rust. It provides a layered architecture from low-level GPU hardware abstraction up to high-level rendering with materials, meshes, and shader compilation:</p>

        <LayerStack layers={[
          { label: "Application Layer (scene, UI, compositing)", detail: "App", color: "pink" },
          { label: "Render Pipeline (lumina-pipeline, lumina-render)", detail: "Rendering", color: "rose" },
          { label: "Material & Mesh (lumina-material, lumina-mesh)", detail: "Assets", color: "purple" },
          { label: "Shader Compiler (lumina-shader → lumina-ir → lumina-spirv)", detail: "Compilation", color: "blue" },
          { label: "GPU Abstraction (lumina-backend, lumina-sync)", detail: "Backend", color: "cyan" },
          { label: "Core Types (lumina-core, lumina-math)", detail: "Foundation", color: "amber" },
          { label: "Memory (lumina-memory) + Debug (lumina-debug)", detail: "Infrastructure", color: "zinc" },
          { label: "Magma GPU Driver (magma-core, magma-hal, magma-command)", detail: "Hardware", color: "green" },
        ]} />
      </Section>

      {/* ── SUB-CRATES ── */}
      <Section title="Sub-Crate Inventory" id="crates">
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
      <Section title="Core Handle System" id="handles">
        <p>Lumina uses a generational handle system for GPU resource management. Handles are lightweight 64-bit IDs — no raw pointers, no reference counting overhead. When a resource is freed, its generation increments, instantly invalidating all outstanding handles:</p>
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
      <Section title="Math Library" id="math">
        <p>Complete linear algebra library optimized for GPU graphics — vectors, matrices, quaternions, and geometric primitives. All types are <code className="text-helix-blue">#[repr(C)]</code> for GPU buffer compatibility:</p>
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
      <Section title="Render Pipeline" id="pipeline">
        <p>The graphics pipeline manages the full vertex-to-pixel path — vertex input, rasterization, depth testing, blending, and render targets:</p>
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
      <Section title="Render Graph" id="rendergraph">
        <p>The render graph automatically manages pass ordering, resource transitions, and barrier insertion. Passes declare their inputs and outputs — the graph compiler resolves dependencies and optimizes execution order:</p>
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
      <Section title="Shader Compilation" id="shaders">
        <p>Lumina includes a full shader compilation pipeline — from a custom shader language through an intermediate representation to SPIR-V bytecode:</p>
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
      <Section title="Magma GPU Driver" id="magma">
        <p>Magma is the Helix native GPU driver — 17,664 lines across 4 sub-crates, providing direct hardware access for Lumina:</p>
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
      <Section title="GPU Synchronization" id="sync">
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
      <Section title="Codebase Scale" id="scale">
        <div className="mt-2 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 rounded-xl p-5">
          <p className="text-lg font-semibold text-white mb-1">197,473 lines · 282 files · 14 sub-crates + Magma driver</p>
          <p className="text-sm text-zinc-400">Lumina is built entirely in <code className="text-helix-blue">no_std</code> Rust. It includes its own math library, shader compiler, IR optimizer, SPIR-V emitter, render graph, and GPU driver — with zero external graphics dependencies.</p>
        </div>
        <FileTree title="graphics/lumina/ + drivers/gpu/magma/" tree={[
          { name: "graphics/lumina", icon: "folder", children: [
            { name: "lumina-core", icon: "folder", detail: "Handles, pools, resource IDs" },
            { name: "lumina-math", icon: "folder", detail: "Vec2/3/4, Mat3/4, Quat, AABB, Frustum" },
            { name: "lumina-shader", icon: "folder", detail: "Shader source parsing" },
            { name: "lumina-ir", icon: "folder", detail: "Intermediate representation" },
            { name: "lumina-spirv", icon: "folder", detail: "SPIR-V bytecode generation" },
            { name: "lumina-macros", icon: "folder", detail: "#[shader], #[vertex], #[uniform]" },
            { name: "lumina-render", icon: "folder", detail: "Render graph, frame context" },
            { name: "lumina-pipeline", icon: "folder", detail: "Graphics/Compute pipeline state" },
            { name: "lumina-material", icon: "folder", detail: "PBR materials, textures, samplers" },
            { name: "lumina-mesh", icon: "folder", detail: "Vertex/Index buffers, mesh data" },
            { name: "lumina-backend", icon: "folder", detail: "GPU device abstraction" },
            { name: "lumina-sync", icon: "folder", detail: "Fence, Semaphore, Barrier" },
            { name: "lumina-memory", icon: "folder", detail: "GPU allocator, suballocation" },
            { name: "lumina-debug", icon: "folder", detail: "Debug markers, validation" },
          ]},
          { name: "drivers/gpu/magma", icon: "folder", children: [
            { name: "magma-core", icon: "folder", detail: "Device discovery, features, limits" },
            { name: "magma-hal", icon: "folder", detail: "MMIO, register banks, PCI" },
            { name: "magma-command", icon: "folder", detail: "Command buffers, submission" },
            { name: "magma-gl", icon: "folder", detail: "OpenGL compatibility layer" },
          ]},
        ]} />
      </Section>

      <Footer />
    </div>
  );
}
