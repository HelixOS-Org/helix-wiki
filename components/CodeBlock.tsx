export default function CodeBlock() {
  return (
    <div className="rounded-xl overflow-hidden bg-[#0d1117] border border-zinc-800 shadow-2xl font-mono text-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-[#161b22]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="ml-2 text-zinc-500 text-xs">src/kernel/traits.rs</span>
      </div>
      <div className="p-6 overflow-x-auto text-zinc-300 leading-relaxed">
        <pre><code>
<span className="text-helix-purple">pub trait</span> <span className="text-yellow-400">KernelModule</span> &#123;
    <span className="text-gray-500">/// Initialize the subsystem</span>
    <span className="text-helix-purple">fn</span> <span className="text-blue-400">init</span>(&self) -&gt; <span className="text-yellow-400">Result</span>&lt;(), Error&gt;;

    <span className="text-gray-500">/// Handle capability requests</span>
    <span className="text-helix-purple">fn</span> <span className="text-blue-400">handle_cap</span>(
        &self, 
        cap: <span className="text-yellow-400">Capability</span>
    ) -&gt; <span className="text-yellow-400">Option</span>&lt;Handle&gt;;

    <span className="text-gray-500">/// Hot-reload state transfer</span>
    <span className="text-helix-purple">fn</span> <span className="text-blue-400">snapshot</span>(&self) -&gt; <span className="text-yellow-400">State</span>;
&#125;

<span className="text-gray-500">// Zero-cost abstraction, infinite flexibility.</span>
<span className="text-helix-purple">impl</span> <span className="text-yellow-400">KernelModule</span> <span className="text-helix-purple">for</span> <span className="text-yellow-400">Scheduler</span> &#123;
    <span className="text-gray-500">/* ... */</span>
&#125;
        </code></pre>
      </div>
    </div>
  );
}
