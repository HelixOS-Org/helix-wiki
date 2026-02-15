export default function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <article className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-helix-purple/50 transition-all duration-300 hover:bg-zinc-900/80 focus-within:ring-2 focus-within:ring-helix-purple">
      <div className="absolute inset-0 bg-gradient-to-br from-helix-blue/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" aria-hidden="true" />
      <div className="relative z-10">
        <div className="mb-4 text-helix-blue group-hover:text-helix-purple transition-colors" aria-hidden="true">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-helix-blue group-hover:to-helix-purple transition-all">
          {title}
        </h3>
        <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
