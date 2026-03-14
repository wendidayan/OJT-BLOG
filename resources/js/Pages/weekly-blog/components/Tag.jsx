/* ── Tag ── */
const TASK_COLORS = [
  "bg-amber-100 text-amber-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-700",
  "bg-lime-100 text-lime-700",
  "bg-orange-100 text-orange-700",
  "bg-cyan-100 text-cyan-700",
];

function getTaskColor(label) {
  const safe = (label || "").toString();
  let hash = 0;
  for (let i = 0; i < safe.length; i++) {
    hash = (hash * 31 + safe.charCodeAt(i)) >>> 0;
  }
  return TASK_COLORS[hash % TASK_COLORS.length] || TASK_COLORS[0];
}

export default function Tag({ label, color }) {
  const resolvedColor = color || getTaskColor(label);
  return (
    <span className={`tag-bounce text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full cursor-default ${resolvedColor}`}>
      {label}
    </span>
  );
}
