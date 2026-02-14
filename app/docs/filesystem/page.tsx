import type { Metadata } from "next";
import PageHeader from "@/helix-wiki/components/PageHeader";
import Section from "@/helix-wiki/components/Section";
import RustCode from "@/helix-wiki/components/RustCode";
import InfoTable from "@/helix-wiki/components/InfoTable";
import Footer from "@/helix-wiki/components/Footer";

export const metadata: Metadata = {
  title: "HelixFS — Copy-on-Write Filesystem with Journaling, B+Tree & ARC Cache",
  description: "HelixFS: a modern CoW filesystem built in Rust. Features write-ahead journaling, B+Tree directory indexing, Adaptive Replacement Cache, POSIX file API, and instant snapshots.",
  alternates: { canonical: "/docs/filesystem" },
  openGraph: {
    title: "HelixFS — A Modern Rust Filesystem for Helix OS",
    description: "On-disk layout, 128-byte inodes, copy-on-write blocks, write-ahead journal with crash recovery, B+Tree O(log n) lookups, ARC cache eviction, and full POSIX API.",
    url: "https://helix-wiki.com/docs/filesystem",
  },
};
import LayerStack from "@/helix-wiki/components/diagrams/LayerStack";

export default function FilesystemPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader title="HelixFS" subtitle="42,824 lines across 66 files — a modern copy-on-write filesystem with journaling, B+Tree indexing, ARC caching, snapshots, compression, and encryption. Zero external dependencies." badge="FILESYSTEM" gradient="from-amber-400 to-orange-500" />

      {/* ── CONSTANTS ── */}
      <Section title="Constants & Architecture" id="constants">
        <p>HelixFS is designed from scratch — zero external dependencies, pure <code className="text-helix-blue">no_std</code> Rust. It uses a layered architecture with clear separation:</p>
        <RustCode filename="fs/src/lib.rs">{`pub const HFS_MAGIC: u32 = 0x48465321;       // "HFS!"
pub const BLOCK_SIZE: usize = 4096;           // 4 KiB blocks
pub const MAX_NAME_LEN: usize = 255;          // Max filename length
pub const MAX_PATH_LEN: usize = 4096;         // Max path length
pub const MAX_FILE_SIZE: u64 = 1 << 60;       // 1 exabyte
pub const ROOT_INO: u64 = 1;                  // Root inode number

// Feature flags (compile-time):
// "journal"     — Write-ahead logging
// "compression" — Transparent block compression
// "encryption"  — Per-file AES encryption
// "integrity"   — Merkle tree verification
// "snapshots"   — CoW snapshots
// "full"        — All of the above`}</RustCode>

        <LayerStack layers={[
          { label: "VFS Layer (inode, dentry, namespace, super)", detail: "POSIX API", color: "amber" },
          { label: "Transaction Layer (atomic operations)", detail: "ACID guarantees", color: "orange" },
          { label: "Metadata (B+Tree / Radix / Snapshot)", detail: "Indexing", color: "purple" },
          { label: "Data (Extent / Block / ARC Cache)", detail: "Storage", color: "blue" },
          { label: "Security (Crypto / Merkle / ACL)", detail: "Protection", color: "cyan" },
          { label: "Block Device Interface", detail: "Hardware", color: "zinc" },
        ]} />

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Module Map</h3>
        <InfoTable
          columns={[
            { header: "Module", key: "module" },
            { header: "Purpose", key: "purpose" },
          ]}
          rows={[
            { module: "vfs/", purpose: "Inode, dentry, namespace, superblock — POSIX-compatible VFS" },
            { module: "metadata/", purpose: "B+Tree indexing, radix tree, snapshot management" },
            { module: "data/", purpose: "Extent-based allocation, block management, ARC cache" },
            { module: "security/", purpose: "Encryption (AES), Merkle integrity, ACL enforcement" },
            { module: "journal/", purpose: "Write-ahead log, transaction management" },
            { module: "common/", purpose: "Error types, hash functions, time, atomic operations" },
            { module: "ops/", purpose: "File operations (create, read, write, delete)" },
            { module: "alloc/", purpose: "Block allocator, free space management" },
            { module: "io/", purpose: "Block device I/O abstraction" },
          ]}
        />
      </Section>

      {/* ── ON-DISK LAYOUT ── */}
      <Section title="On-Disk Layout" id="layout">
        <p>The superblock is the first structure on disk — it identifies the filesystem, tracks state, and stores key parameters:</p>
        <RustCode filename="fs/src/vfs/superblock.rs">{`pub struct Superblock {
    pub magic: u32,            // 0x48465321 ("HFS!")
    pub version: u32,          // Filesystem format version
    pub state: FsState,        // Clean, dirty, or error
    pub block_size: u32,       // Always 4096
    pub total_blocks: u64,     // Total blocks on device
    pub free_blocks: u64,      // Currently available blocks
    pub total_inodes: u64,     // Total inode slots
    pub free_inodes: u64,      // Available inode slots
    pub root_inode: u64,       // Inode number of "/"
    pub journal_start: u64,    // Block offset of journal
    pub journal_size: u64,     // Journal size in blocks
    pub features: u64,         // Enabled feature flags
    pub mount_count: u32,      // Mounts since last fsck
    pub max_mount_count: u32,  // Force fsck after this many mounts
    pub last_mount_time: u64,  // UNIX timestamp
    pub last_write_time: u64,
    pub uuid: [u8; 16],        // Filesystem UUID
    pub volume_name: [u8; 64], // Volume label
}

pub enum FsState {
    Clean,     // Properly unmounted
    Dirty,     // Mounted or crashed
    Error,     // Errors detected
    Readonly,  // Forced read-only
}`}</RustCode>
      </Section>

      {/* ── INODES ── */}
      <Section title="Inode Structure" id="inodes">
        <p>Every file and directory is represented by an inode with full POSIX semantics — permissions, timestamps, link count, and extent-based data references:</p>
        <RustCode filename="fs/src/vfs/inode.rs">{`pub struct Inode {
    pub ino: u64,              // Unique inode number
    pub mode: u16,             // File type + UNIX permissions
    pub uid: u32,              // Owner user ID
    pub gid: u32,              // Owner group ID
    pub size: u64,             // File size in bytes
    pub atime: u64,            // Last access time
    pub mtime: u64,            // Last modification time
    pub ctime: u64,            // Last status change time
    pub crtime: u64,           // Creation time
    pub nlink: u32,            // Hard link count
    pub blocks: u64,           // Allocated blocks (512-byte units)
    pub flags: InodeFlags,     // State flags
    pub generation: u32,       // NFS generation number
    pub refcount: AtomicU32,   // In-memory reference count
    pub file_type: FileType,   // Type classification
    pub extents: Vec<Extent>,  // Data block mapping
}

bitflags! {
    pub struct InodeFlags: u32 {
        const I_DIRTY       = 1 << 0;   // Needs writeback
        const I_SYNC        = 1 << 1;   // Synchronous writes
        const I_NEW         = 1 << 2;   // Freshly allocated
        const I_FREEING     = 1 << 3;   // Being deleted
        const I_DIRTY_PAGES = 1 << 4;   // Has dirty page cache
        const I_DIRTY_META  = 1 << 5;   // Metadata dirty
        const I_LOCK        = 1 << 6;   // Locked for I/O
        const I_REFERENCED  = 1 << 7;   // Recently accessed
        const I_IMMUTABLE   = 1 << 8;   // Cannot be modified
        const I_APPEND      = 1 << 9;   // Append-only
    }
}

pub enum FileType {
    Regular,
    Directory,
    Symlink,
    CharDevice,
    BlockDevice,
    Fifo,
    Socket,
}

/// Factory methods:
impl Inode {
    pub fn new_file(ino: u64, mode: u16) -> Self;
    pub fn new_dir(ino: u64, mode: u16) -> Self;
    pub fn new_symlink(ino: u64) -> Self;
}

// Permission constants:
pub const S_IRUSR: u16 = 0o400;  // Owner read
pub const S_IWUSR: u16 = 0o200;  // Owner write
pub const S_IXUSR: u16 = 0o100;  // Owner execute
pub const S_IRGRP: u16 = 0o040;
pub const S_IWGRP: u16 = 0o020;
pub const S_IXGRP: u16 = 0o010;
pub const S_IROTH: u16 = 0o004;
pub const S_IWOTH: u16 = 0o002;
pub const S_IXOTH: u16 = 0o001;`}</RustCode>

        <h3 className="text-xl font-semibold text-white mt-10 mb-4">Extent-Based Allocation</h3>
        <RustCode filename="fs/src/data/extent.rs">{`/// An extent maps a contiguous range of file blocks to disk blocks.
/// Much more efficient than indirect block pointers.
pub struct Extent {
    pub file_block: u64,   // Starting logical block in file
    pub disk_block: u64,   // Starting physical block on disk
    pub length: u32,       // Number of contiguous blocks
    pub flags: ExtentFlags,
}

bitflags! {
    pub struct ExtentFlags: u32 {
        const ALLOCATED  = 1 << 0;  // Blocks allocated
        const WRITTEN    = 1 << 1;  // Data written
        const COMPRESSED = 1 << 2;  // Compressed blocks
        const ENCRYPTED  = 1 << 3;  // Encrypted blocks
        const COW        = 1 << 4;  // Copy-on-write
    }
}

// Example: a 1 MiB file might have a single extent:
//   Extent { file_block: 0, disk_block: 1000, length: 256 }
// That's 256 × 4 KiB = 1 MiB, contiguous on disk.`}</RustCode>
      </Section>

      {/* ── POSIX ── */}
      <Section title="POSIX File API" id="posix">
        <p>Full POSIX-compatible file operations — the <code className="text-helix-blue">FileSystem</code> trait covers everything from open/read/write to hardlinks and directory operations:</p>
        <RustCode filename="fs/src/ops/mod.rs">{`pub trait FileSystem: Send + Sync {
    // ── File operations ──
    fn open(&mut self, path: &str, flags: OpenFlags)
        -> Result<FileDescriptor, FsError>;
    fn close(&mut self, fd: FileDescriptor) -> Result<(), FsError>;
    fn read(&mut self, fd: FileDescriptor, buf: &mut [u8])
        -> Result<usize, FsError>;
    fn write(&mut self, fd: FileDescriptor, buf: &[u8])
        -> Result<usize, FsError>;
    fn seek(&mut self, fd: FileDescriptor, offset: i64,
            whence: SeekWhence) -> Result<u64, FsError>;
    fn stat(&self, path: &str) -> Result<FileStat, FsError>;
    fn fstat(&self, fd: FileDescriptor) -> Result<FileStat, FsError>;
    fn truncate(&mut self, path: &str, size: u64) -> Result<(), FsError>;

    // ── Directory operations ──
    fn mkdir(&mut self, path: &str, mode: u16) -> Result<(), FsError>;
    fn rmdir(&mut self, path: &str) -> Result<(), FsError>;
    fn readdir(&self, path: &str) -> Result<Vec<DirEntry>, FsError>;

    // ── Link operations ──
    fn link(&mut self, src: &str, dst: &str) -> Result<(), FsError>;
    fn unlink(&mut self, path: &str) -> Result<(), FsError>;
    fn symlink(&mut self, target: &str, link: &str) -> Result<(), FsError>;
    fn readlink(&self, path: &str) -> Result<String, FsError>;

    // ── Metadata ──
    fn chmod(&mut self, path: &str, mode: u16) -> Result<(), FsError>;
    fn chown(&mut self, path: &str, uid: u32, gid: u32) -> Result<(), FsError>;
    fn rename(&mut self, old: &str, new: &str) -> Result<(), FsError>;

    // ── Filesystem ──
    fn sync(&mut self) -> Result<(), FsError>;
    fn statfs(&self) -> Result<FsStats, FsError>;
}

pub enum SeekWhence { Set, Cur, End }

pub struct FileStat {
    pub ino: u64,
    pub size: u64,
    pub blocks: u64,
    pub mode: u16,
    pub uid: u32,
    pub gid: u32,
    pub nlink: u32,
    pub atime: u64,
    pub mtime: u64,
    pub ctime: u64,
}`}</RustCode>
      </Section>

      {/* ── COW ── */}
      <Section title="Copy-on-Write" id="cow">
        <p>CoW enables instant snapshots and efficient writes — blocks are never modified in place. A write to a shared block allocates a new block and updates only the pointer:</p>
        <RustCode filename="fs/src/data/cow.rs">{`pub struct CowManager {
    refcounts: BTreeMap<u64, u32>,   // block → reference count
    pending_copies: Vec<CowCopy>,
    allocator: BlockAllocator,
}

struct CowCopy {
    original_block: u64,
    new_block: u64,
    inode: u64,
}

impl CowManager {
    /// Write to a block. If refcount > 1, copy first.
    pub fn cow_write(&mut self, block: u64, data: &[u8])
        -> Result<u64, FsError> {
        if self.refcounts.get(&block).copied().unwrap_or(1) > 1 {
            // Block is shared — copy it
            let new_block = self.allocator.allocate(1)?;
            self.copy_block(block, new_block)?;
            self.decrement_refcount(block);
            self.write_block(new_block, data)?;
            Ok(new_block)
        } else {
            // Block is exclusive — write in place
            self.write_block(block, data)?;
            Ok(block)
        }
    }

    /// Create a snapshot — O(1) by just incrementing refcounts.
    pub fn snapshot(&mut self) -> Result<SnapshotId, FsError>;

    /// Delete a snapshot — decrement refcounts, free if zero.
    pub fn delete_snapshot(&mut self, id: SnapshotId) -> Result<(), FsError>;
}`}</RustCode>
      </Section>

      {/* ── JOURNAL ── */}
      <Section title="Journal" id="journal">
        <p>Write-ahead logging for crash consistency. Every metadata modification goes through the journal — if the system crashes, replay recovers to a consistent state:</p>
        <RustCode filename="fs/src/journal/mod.rs">{`pub struct Journal {
    log: CircularBuffer,    // Ring buffer of journal entries
    head: u64,              // Oldest active transaction
    tail: u64,              // Next write position
    sequence: u64,          // Monotonic sequence number
    block_size: u32,
}

pub struct JournalTransaction {
    pub id: u64,
    pub entries: Vec<JournalEntry>,
    pub state: TransactionState,
    pub timestamp: u64,
}

pub enum JournalEntry {
    /// Log the old content of a block before modification.
    BlockWrite {
        block: u64,
        old_data: Vec<u8>,
        new_data: Vec<u8>,
    },
    /// Inode metadata change.
    InodeUpdate {
        ino: u64,
        field: InodeField,
        old_value: u64,
        new_value: u64,
    },
    /// Directory entry modification.
    DentryChange {
        parent_ino: u64,
        name: String,
        change_type: DentryChangeType,
    },
    /// Transaction commit marker.
    Commit { sequence: u64 },
    /// Transaction abort marker.
    Abort { sequence: u64 },
}

pub enum TransactionState {
    Active,      // Currently being built
    Committing,  // Writing to disk
    Committed,   // Fully persisted
    Aborted,     // Rolled back
}

impl Journal {
    /// Begin a new transaction.
    pub fn begin(&mut self) -> JournalTransaction;

    /// Commit a transaction — flush to disk.
    pub fn commit(&mut self, txn: JournalTransaction)
        -> Result<(), FsError>;

    /// Abort a transaction — discard entries.
    pub fn abort(&mut self, txn: JournalTransaction);

    /// Replay journal after crash — restore consistency.
    pub fn replay(&mut self) -> Result<usize, FsError>;

    /// Checkpoint — advance head past committed transactions.
    pub fn checkpoint(&mut self) -> Result<(), FsError>;
}`}</RustCode>
      </Section>

      {/* ── BTREE ── */}
      <Section title="B+Tree Index" id="btree">
        <p>Order-128 B+Tree for directory indexing and extent mapping. All data is in leaf nodes; internal nodes contain only keys and child pointers — optimal for disk-based access patterns:</p>
        <RustCode filename="fs/src/metadata/btree.rs">{`pub struct BPlusTree<K: Ord + Clone, V: Clone> {
    root: Option<Box<Node<K, V>>>,
    order: usize,          // 128 — keys per node
    height: usize,
    count: usize,          // Total key-value pairs
}

enum Node<K, V> {
    Internal {
        keys: Vec<K>,
        children: Vec<Box<Node<K, V>>>,
    },
    Leaf {
        keys: Vec<K>,
        values: Vec<V>,
        next: Option<Box<Node<K, V>>>,  // Linked list for range scans
    },
}

impl<K: Ord + Clone, V: Clone> BPlusTree<K, V> {
    pub fn new() -> Self;

    /// Point lookup — O(log n).
    pub fn search(&self, key: &K) -> Option<&V>;

    /// Insert or update — O(log n), may split nodes.
    pub fn insert(&mut self, key: K, value: V);

    /// Delete — O(log n), may merge nodes.
    pub fn remove(&mut self, key: &K) -> Option<V>;

    /// Range scan — O(log n + k) where k = results.
    /// Follows leaf linked list for sequential access.
    pub fn range(&self, start: &K, end: &K) -> Vec<(&K, &V)>;

    /// Number of key-value pairs.
    pub fn len(&self) -> usize;

    /// Tree height (number of levels).
    pub fn height(&self) -> usize;
}

// Order 128 → each node holds up to 127 keys.
// For a tree with 10M entries:
//   Height ≈ log₁₂₈(10M) ≈ 3.3 → max 4 disk reads per lookup.`}</RustCode>
      </Section>

      {/* ── ARC ── */}
      <Section title="ARC Cache" id="arc">
        <p>Adaptive Replacement Cache — a self-tuning cache that outperforms LRU by adapting to both recency and frequency of access. Uses 4 lists to track access patterns:</p>
        <RustCode filename="fs/src/data/cache.rs">{`pub struct ArcCache<K: Hash + Eq + Clone, V: Clone> {
    // ── Active lists (contain actual data) ──
    t1: LinkedHashMap<K, V>,    // Recent: seen once recently
    t2: LinkedHashMap<K, V>,    // Frequent: seen at least twice

    // ── Ghost lists (track eviction history, no data) ──
    b1: LinkedHashSet<K>,       // Recently evicted from T1
    b2: LinkedHashSet<K>,       // Recently evicted from T2

    capacity: usize,            // Maximum cache entries
    p: usize,                   // Adaptive target size for T1
    hits: u64,
    misses: u64,
}

impl<K: Hash + Eq + Clone, V: Clone> ArcCache<K, V> {
    pub fn new(capacity: usize) -> Self;

    /// Lookup — O(1). Promotes to T2 if already in T1.
    pub fn get(&mut self, key: &K) -> Option<&V>;

    /// Insert — O(1). Adapts T1/T2 balance based on ghost hits.
    pub fn put(&mut self, key: K, value: V);

    /// Remove an entry explicitly.
    pub fn remove(&mut self, key: &K) -> Option<V>;

    /// Hit rate: hits / (hits + misses).
    pub fn hit_rate(&self) -> f64;

    pub fn len(&self) -> usize;
    pub fn capacity(&self) -> usize;
}

// How ARC adapts:
// - Ghost hit in B1 → workload favors recency → increase p (grow T1)
// - Ghost hit in B2 → workload favors frequency → decrease p (grow T2)
// This self-tuning means ARC automatically adapts to any workload
// pattern without manual configuration.`}</RustCode>
      </Section>

      {/* ── FEATURES ── */}
      <Section title="Feature Summary" id="features">
        <InfoTable
          columns={[
            { header: "Feature", key: "feature" },
            { header: "Implementation", key: "impl" },
            { header: "Status", key: "status" },
          ]}
          rows={[
            { feature: "Copy-on-Write", impl: "Refcounted blocks, O(1) snapshots", status: "✅ Complete" },
            { feature: "Journaling", impl: "Circular WAL, crash replay", status: "✅ Complete" },
            { feature: "B+Tree Index", impl: "Order-128, leaf-linked range scans", status: "✅ Complete" },
            { feature: "ARC Cache", impl: "4-list adaptive replacement", status: "✅ Complete" },
            { feature: "Extent Mapping", impl: "Contiguous block ranges", status: "✅ Complete" },
            { feature: "POSIX API", impl: "Full open/read/write/seek/stat/dir/link", status: "✅ Complete" },
            { feature: "Compression", impl: "Per-block transparent compression", status: "🔶 Feature-gated" },
            { feature: "Encryption", impl: "Per-file AES encryption", status: "🔶 Feature-gated" },
            { feature: "Integrity", impl: "Merkle tree block verification", status: "🔶 Feature-gated" },
            { feature: "Snapshots", impl: "CoW-based instant snapshots", status: "🔶 Feature-gated" },
            { feature: "Max File Size", impl: "1 exabyte (2⁶⁰ bytes)", status: "📐 By design" },
            { feature: "Zero Dependencies", impl: "Pure no_std Rust, no libc", status: "✅ Verified" },
          ]}
        />
        <div className="mt-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
          <p className="text-lg font-semibold text-white mb-1">42,824 lines · 66 files · 0 dependencies</p>
          <p className="text-sm text-zinc-400">HelixFS is entirely self-contained. No libc, no external crates, no C FFI. The RAM disk demo in <code className="text-helix-blue">profiles/minimal</code> uses a 4 MiB in-memory block device with 1,024 blocks.</p>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
