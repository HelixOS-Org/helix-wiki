import React from "react";

interface Column {
  header: string;
  key: string;
  className?: string;
}

interface Props {
  columns: Column[];
  rows: Record<string, React.ReactNode>[];
}

export default function InfoTable({ columns, rows }: Props) {
  return (
    <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800/60 bg-zinc-900/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-5 py-3 text-zinc-400 font-medium ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-900/30 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3 text-zinc-300 ${col.className || ""}`}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
