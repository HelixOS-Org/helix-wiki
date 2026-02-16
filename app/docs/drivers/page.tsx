"use client";

import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";
import FlowDiagram from "@/helix-wiki/components/diagrams/FlowDiagram";
import { useI18n } from "@/helix-wiki/lib/i18n";
import { getDocString } from "@/helix-wiki/lib/docs-i18n";
import driversContent from "@/helix-wiki/lib/docs-i18n/drivers";

export default function DriversPage() {
  const { locale } = useI18n();
  const d = (key: string) => getDocString(driversContent, locale, key);
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        title={d("header.title")}
        subtitle={d("header.subtitle")}
        badge={d("header.badge")}
      />

      {/* ── OVERVIEW ── */}
      <Section title={d("section.arch")} id="overview">
        <p>{d("arch.intro")}</p>

        <LayerStack title="Driver Architecture" layers={[
          { label: "User Space / Modules (Filesystem, Graphics, Network)", detail: "Applications", color: "purple",
            description: "User-facing modules that consume driver services — filesystem operations, GPU rendering, and network I/O all route through the driver framework.",
            info: { components: ["Filesystem Module", "Graphics Module", "Network Module"], metrics: [{ label: "Modules", value: "12+", color: "#7B68EE" }], api: ["open()", "read()", "write()", "ioctl()"], status: "active" } },
          { label: "Driver Framework (Block, GPU, Net, ...)", detail: "Abstraction", color: "blue",
            description: "Trait-based driver framework providing unified interfaces for block devices, GPU, network, input, and character devices. Drivers implement DeviceTrait and register via the module system.",
            info: { components: ["Block Driver", "GPU Driver", "Net Driver", "Input Driver"], metrics: [{ label: "Traits", value: "5", color: "#4A90E2" }, { label: "Hot-Swap", value: "Yes", color: "#22C55E" }], api: ["DeviceTrait::probe()", "DeviceTrait::init()", "register_driver()"], status: "active" } },
          { label: "HAL (PCI/MMIO · Port I/O · DMA · IRQ)", detail: "Hardware Access", color: "amber",
            description: "Hardware Abstraction Layer providing safe wrappers for PCI enumeration, MMIO register access, port I/O, DMA buffer management, and interrupt registration.",
            info: { components: ["PCI Enumerator", "MMIO Mapper", "Port I/O", "DMA Engine", "IRQ Router"], metrics: [{ label: "Access", value: "Safe", color: "#F59E0B" }], api: ["pci::find_device()", "mmio_read()", "port_write()", "dma_alloc()"], status: "active" } },
          { label: "Hardware (Physical Devices)", detail: "Silicon", color: "zinc",
            description: "Physical hardware — GPUs, NICs, storage controllers, USB hosts, and other peripherals connected via PCI, MMIO, or platform buses.",
            info: { components: ["GPU", "NIC", "Storage", "USB", "Serial"], metrics: [{ label: "Bus", value: "PCI/MMIO" }], status: "passive" } },
        ]} />
      </Section>

      {/* ── MAGMA ── */}
      <Section title={d("section.magma")} id="magma">
        <p>{d("magma.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Crate Structure</h3>
        <InfoTable
          columns={[
            { header: "Crate", key: "crate" },
            { header: "Purpose", key: "purpose" },
            { header: "Key Types", key: "types" },
          ]}
          rows={[
            { crate: <code className="text-helix-blue">magma-core</code>, purpose: "Core engine traits, GPU address types, device abstraction", types: "GpuDevice, GpuAddress, EngineType" },
            { crate: <code className="text-helix-blue">magma-cmd</code>, purpose: "Command buffer construction and submission", types: "CommandBuffer, CommandStream, Fence" },
            { crate: <code className="text-helix-blue">magma-hal</code>, purpose: "PCI/MMIO/IOMMU hardware abstraction", types: "PciDevice, MmioRegion, Bar" },
            { crate: <code className="text-helix-blue">magma-mem</code>, purpose: "GPU memory management (buddy allocator)", types: "GpuAllocator, GpuBuffer, Mapping" },
            { crate: <code className="text-helix-blue">magma-gl</code>, purpose: "OpenGL-like API layer", types: "GlContext, Texture, Shader, Program" },
            { crate: <code className="text-helix-blue">magma-vk</code>, purpose: "Vulkan API layer", types: "VkInstance, VkDevice, VkQueue" },
            { crate: <code className="text-helix-blue">magma-gsp</code>, purpose: "GPU System Processor RPC communication", types: "GspChannel, RpcMessage" },
          ]}
        />

        <p>{d("gpu.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">GPU Initialization</h3>
        <RustCode filename="drivers/gpu/magma/">{`/// Magma GPU driver initialization flow
pub fn init_gpu() -> Result<GpuDevice, MagmaError> {
    // 1. PCI enumeration — find GPU device
    let pci_dev = pci::find_device(
        PCI_CLASS_DISPLAY,
        PCI_SUBCLASS_VGA
    )?;

    // 2. Map BARs (Base Address Registers)
    let bar0 = pci_dev.map_bar(0)?;   // MMIO registers
    let bar1 = pci_dev.map_bar(1)?;   // VRAM / framebuffer

    // 3. Initialize GPU memory allocator
    let allocator = GpuAllocator::new(
        bar1.base(),
        bar1.size(),
        BuddyAllocator::default(),
    );

    // 4. Set up command buffer ring
    let cmd_ring = CommandRing::new(&allocator, 4096)?;

    // 5. Initialize GSP (if available)
    let gsp = GspChannel::probe(&bar0)?;

    // 6. Create device handle
    Ok(GpuDevice {
        pci: pci_dev,
        regs: bar0,
        memory: allocator,
        commands: cmd_ring,
        gsp,
    })
}`}</RustCode>

        <p>{d("pipeline.intro")}</p>

        <h3 className="text-xl font-semibold text-white mt-8 mb-4">Command Buffer Pipeline</h3>
        <FlowDiagram
          title="Command Submission Pipeline"
          phases={[
            { title: "Build", color: "blue", description: "CPU records draw calls, state changes, and resource bindings into a command buffer.", nodes: [
              { label: "Bind Pipeline", color: "blue", info: { description: "Select graphics/compute pipeline with shaders and fixed-function state.", duration: "~50ns", priority: "high", outputs: ["Pipeline state"] } },
              { label: "Bind Buffers", color: "blue", info: { description: "Attach vertex, index, and uniform buffers to the command stream.", duration: "~30ns", priority: "normal" } },
              { label: "Draw Call", color: "blue", info: { description: "Record the draw command with vertex range and instance count.", duration: "~20ns", priority: "normal", outputs: ["CommandBuffer"] } },
            ]},
            { title: "Submit", color: "purple", description: "CPU submits the filled command buffer to the GPU ring buffer.", nodes: [
              { label: "Ring Insert", color: "purple", info: { description: "Write command buffer pointer into the GPU submission ring. Doorbell MMIO write triggers GPU.", duration: "~100ns", priority: "critical", outputs: ["Fence token"] } },
            ]},
            { title: "Execute", color: "amber", description: "GPU processes the command buffer asynchronously.", nodes: [
              { label: "GPU Work", color: "amber", info: { description: "GPU fetches commands from ring, executes draw calls, rasterizes, and writes to render targets.", duration: "Variable", priority: "critical" } },
            ]},
            { title: "Complete", color: "green", description: "GPU signals completion via fence and IRQ.", nodes: [
              { label: "Fence Signal", color: "green", info: { description: "GPU writes fence value to memory. IRQ notifies CPU. fence.wait() returns.", duration: "~1μs", priority: "high", outputs: ["Rendered frame"] } },
            ]},
          ]}
        />
        <RustCode filename="Command Submission API">{`let mut cmd = CommandBuffer::new(&device);
cmd.bind_pipeline(&pipeline);
cmd.bind_vertex_buffer(&vbuf);
cmd.draw(0..vertex_count);

let fence = device.submit(cmd)?;
fence.wait()?; // Block until GPU completes`}</RustCode>
      </Section>

      {/* ── PLANNED DRIVERS ── */}
      <Section title={d("section.planned")} id="planned">
        <p>{d("planned.intro")}</p>
        <InfoTable
          columns={[
            { header: "Driver", key: "driver" },
            { header: "Type", key: "type" },
            { header: "Interface", key: "interface" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { driver: <strong className="text-white">VirtIO Block</strong>, type: "Block Device", interface: "VirtIO PCI / MMIO", status: <span className="text-yellow-400">🔜 Planned</span> },
            { driver: <strong className="text-white">VirtIO Net</strong>, type: "Network", interface: "VirtIO PCI / MMIO", status: <span className="text-yellow-400">🔜 Planned</span> },
            { driver: <strong className="text-white">VirtIO Console</strong>, type: "Character", interface: "VirtIO PCI", status: <span className="text-yellow-400">🔜 Planned</span> },
            { driver: <strong className="text-white">PS/2 Keyboard</strong>, type: "Input", interface: "Port I/O (0x60/0x64)", status: <span className="text-yellow-400">🔜 Planned</span> },
            { driver: <strong className="text-white">Serial (16550)</strong>, type: "Character", interface: "Port I/O / MMIO", status: <span className="text-yellow-400">🔜 Planned</span> },
            { driver: <strong className="text-white">Framebuffer</strong>, type: "Display", interface: "Linear FB / MMIO", status: <span className="text-yellow-400">🔜 Planned</span> },
          ]}
        />
      </Section>

      {/* ── WRITING DRIVERS ── */}
      <Section title={d("section.writing")} id="writing">
        <p>{d("writing.intro")}</p>

        <RustCode filename="modules_impl/drivers/serial/src/lib.rs">{`#![no_std]

use helix_modules::{ModuleTrait, ModuleMetadata, ModuleType};

pub struct SerialDriver {
    port: u16,
    initialized: bool,
}

impl ModuleTrait for SerialDriver {
    fn metadata(&self) -> ModuleMetadata {
        ModuleMetadata {
            name: "helix-driver-serial",
            version: semver::Version::new(1, 0, 0),
            module_type: ModuleType::Driver,
            dependencies: &[],
        }
    }

    fn init(&mut self) -> Result<(), ModuleError> {
        // Initialize COM1 (0x3F8)
        self.port = 0x3F8;
        
        // Disable interrupts
        outb(self.port + 1, 0x00);
        // Set baud rate (115200)
        outb(self.port + 3, 0x80);  // Enable DLAB
        outb(self.port + 0, 0x01);  // Divisor low byte
        outb(self.port + 1, 0x00);  // Divisor high byte
        outb(self.port + 3, 0x03);  // 8N1
        outb(self.port + 2, 0xC7);  // Enable FIFO
        outb(self.port + 4, 0x0B);  // IRQs enabled, RTS/DSR set
        
        self.initialized = true;
        Ok(())
    }

    fn cleanup(&mut self) -> Result<(), ModuleError> {
        self.initialized = false;
        Ok(())
    }
}

// Register with the module system
helix_modules::define_module!(SerialDriver);`}</RustCode>
      </Section>

    </div>
  );
}
