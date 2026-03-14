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
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
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
    img: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80",
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
    img: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80",
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
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
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
    imgs: [
      "https://images.unsplash.com/photo-1551703599-6b3e8379aa8c?w=400&q=80",
      "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=400&q=80",
    ],
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
    imgs: [
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    ],
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
    imgs: [
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
    ],
    tag: "Project",
    tagColor: "bg-orange-100 text-orange-800",
  },
];
