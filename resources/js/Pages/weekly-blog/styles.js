export const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Nunito:wght@400;500;600;700&display=swap');

@keyframes fadeDown {
  from { opacity:0; transform:translateY(-16px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fadeIn {
  from { opacity:0; }
  to   { opacity:1; }
}
@keyframes scaleIn {
  from { opacity:0; transform:scale(0.93); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(251,191,36,0.45); }
  70%  { box-shadow: 0 0 0 10px rgba(251,191,36,0); }
  100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); }
}
@keyframes float {
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
}
@keyframes slideInRight {
  from { opacity:0; transform:translateX(32px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes drawerInRight {
  from { transform:translateX(100%); }
  to   { transform:translateX(0); }
}
@keyframes drawerOutRight {
  from { transform:translateX(0); }
  to   { transform:translateX(100%); }
}
@keyframes popIn {
  0%   { opacity:0; transform:scale(0.7); }
  70%  { transform:scale(1.06); }
  100% { opacity:1; transform:scale(1); }
}
@keyframes typewriter {
  from { width:0; }
  to   { width:100%; }
}
@keyframes blink {
  0%,100% { border-color:transparent; }
  50%      { border-color:#f59e0b; }
}

.anim-fade-down  { animation: fadeDown  0.55s ease both; }
.anim-fade-up    { animation: fadeUp    0.6s  ease both; }
.anim-fade-in    { animation: fadeIn    0.5s  ease both; }
.anim-scale-in   { animation: scaleIn   0.5s  cubic-bezier(.22,1,.36,1) both; }
.anim-float      { animation: float     3.5s  ease-in-out infinite; }
.anim-pop-in     { animation: popIn     0.45s cubic-bezier(.22,1,.36,1) both; }
.anim-slide-right{ animation: slideInRight 0.5s ease both; }

.drawer-enter { animation: drawerInRight 0.38s cubic-bezier(.22,1,.36,1) both; }
.drawer-exit  { animation: drawerOutRight 0.32s cubic-bezier(.55,0,1,.45) both; }

.hover-lift {
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.09);
}

.hover-img img {
  transition: transform 0.4s ease;
}
.hover-img:hover img {
  transform: scale(1.06);
}

.btn-bounce {
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.btn-bounce:hover  { transform: scale(1.04); }
.btn-bounce:active { transform: scale(0.96); }

.pulse-amber { animation: pulse-ring 2s ease-out infinite; }

.nav-link-line {
  position: relative;
}
.nav-link-line::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 50%; right: 50%;
  height: 2px;
  background: #f59e0b;
  border-radius: 2px;
  transition: left 0.25s ease, right 0.25s ease;
}
.nav-link-line:hover::after { left: 10%; right: 10%; }

.tag-bounce {
  transition: transform 0.18s ease;
}
.tag-bounce:hover { transform: scale(1.08); }

.lightbox-enter {
  animation: scaleIn 0.3s cubic-bezier(.22,1,.36,1) both;
}
`;
