import Reveal from "./Reveal";

/* ── AboutPage ── */
export default function AboutPage() {
  const skills = [
    { label: "Networking", color: "bg-amber-100 text-amber-700" },
    { label: "Linux", color: "bg-green-100 text-green-700" },
    { label: "Databases", color: "bg-blue-100 text-blue-700" },
    { label: "Web Dev", color: "bg-rose-100 text-rose-700" },
    { label: "OS", color: "bg-violet-100 text-violet-700" },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Reveal>
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 text-center hover-lift">
          <div
            className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto mb-4 anim-float"
            style={{ animationDelay: "0.2s" }}
          >
            👨‍💻
          </div>
          <h2 className="font-serif text-2xl text-stone-800 mb-1">Hey, I'm Wendee Diane</h2>
          <p className="text-stone-400 text-sm mb-6">4th Year BSIT Student · Bicol University</p>
          <p className="text-stone-500 text-sm leading-relaxed mb-4">
            This blog is my weekly learning journal — a place to document what I'm studying, what broke, what finally clicked, and the reads that kept me curious.
          </p>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            Subjects right now: Computer Networks, Operating Systems, Database Management, and Web Development. Perpetually caffeinated.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {skills.map((s, i) => (
              <span
                key={s.label}
                className={`tag-bounce text-xs font-semibold px-3 py-1 rounded-full ${s.color} anim-pop-in`}
                style={{ animationDelay: `${i * 80}ms`, cursor: "default" }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
