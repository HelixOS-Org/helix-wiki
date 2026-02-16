"use client";

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
    <div className="overflow-x-auto my-6 rounded-xl"
      style={{
        background: "rgba(255,255,255,.01)",
        border: "1px solid rgba(255,255,255,.06)",
        boxShadow: "0 4px 24px rgba(0,0,0,.2)",
      }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "rgba(255,255,255,.02)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-[.12em] text-zinc-500 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="transition-colors duration-200 hover:bg-white/[.015]"
              style={{ borderBottom: i < rows.length - 1 ? "1px solid rgba(255,255,255,.03)" : "none" }}>
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-3.5 text-zinc-300 ${col.className || ""}`}>
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
