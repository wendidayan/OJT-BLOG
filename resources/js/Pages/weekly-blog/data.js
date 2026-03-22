export const NAV_ITEMS = ["Home", "Blog", "Documentation", "About"];

export const BLOG_POSTS = [
  {
    id: 1,
    week: "Week 12",
    date: "March 10, 2026",
    tag: "Networking",
    tagColor: "bg-amber-100 text-amber-800",
    title: "Subnetting finally clicked — here's how I got it",
    excerpt:
      "After three failed attempts to understand CIDR notation, one whiteboard session changed everything. Here's the mental model that made subnetting feel obvious.",
    readTime: "6 min",
    featured: true,
  },
  {
    id: 2,
    week: "Week 11",
    date: "March 3, 2026",
    tag: "Linux",
    tagColor: "bg-green-100 text-green-800",
    title: "My first week living inside the terminal",
    excerpt:
      "No GUI, just bash. A self-imposed challenge that broke me on day two and rebuilt me stronger by day five.",
    readTime: "5 min",
  },
  {
    id: 3,
    week: "Week 10",
    date: "Feb 24, 2026",
    tag: "Database",
    tagColor: "bg-blue-100 text-blue-800",
    title: "SQL joins explained with actual student data",
    excerpt:
      "I used our class enrollment data to finally understand LEFT, RIGHT, and INNER joins — and the results were surprising.",
    readTime: "7 min",
  },
  {
    id: 4,
    week: "Week 9",
    date: "Feb 17, 2026",
    tag: "Web Dev",
    tagColor: "bg-rose-100 text-rose-800",
    title: "Building my first REST API from scratch",
    excerpt:
      "Node.js, Express, and a lot of Googling. Here's what actually worked and what the tutorials got wrong.",
    readTime: "9 min",
  },
];

export const DOCS = [
  {
    id: 1,
    week: "Week 12",
    date: "March 10, 2026",
    subject: "Computer Networks",
    title: "Network Topology Lab — Star vs. Mesh",
    desc: "Physical setup and packet trace analysis comparing star and mesh topologies using Cisco Packet Tracer.",
    tag: "Lab",
    tagColor: "bg-teal-100 text-teal-800",
  },
  {
    id: 2,
    week: "Week 11",
    date: "March 3, 2026",
    subject: "Operating Systems",
    title: "Process Scheduling Simulation",
    desc: "Screenshots and notes from implementing FCFS, SJF, and Round Robin in a custom scheduler built in C.",
    tag: "Activity",
    tagColor: "bg-violet-100 text-violet-800",
  },
  {
    id: 3,
    week: "Week 10",
    date: "Feb 24, 2026",
    subject: "Database Management",
    title: "ER Diagram & Normalization Worksheet",
    desc: "Full documentation of our library system design project — entity relationships, normal forms, and final schema.",
    tag: "Project",
    tagColor: "bg-orange-100 text-orange-800",
  },
];
