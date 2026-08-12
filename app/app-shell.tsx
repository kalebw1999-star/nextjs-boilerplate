"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const items=[
  ["/dashboard","Command"],["/","Assess"],["/profile","Player"],["/messages","Comms"],["/clip","Clip IQ"]
] as const;
export default function AppShell({children}:{children:ReactNode}){
 const pathname=usePathname();
 if(pathname==="/login"||pathname==="/signup") return <>{children}</>;
 return <div className="arena-shell"><aside className="arena-sidebar"><Link href="/dashboard" className="arena-brand"><span className="arena-mark">CX</span><span><b>CYBER</b><small>ARENA</small></span></Link><div className="arena-nav-label">WORKSPACE</div><nav>{items.map(([href,label])=><Link key={href} href={href} className={pathname===href?"arena-nav active":"arena-nav"}><span className="arena-nav-dot"/><span>{label}</span></Link>)}{pathname.startsWith("/admin")&&<Link href="/admin" className="arena-nav active"><span className="arena-nav-dot"/><span>Scouting HQ</span></Link>}</nav><div className="arena-side-bottom"><div className="arena-status"><i/>SYSTEM ONLINE</div><p>PLAYER NETWORK<br/><b>CYBER ARENA</b></p></div></aside><div className="arena-content"><header className="arena-topbar"><div><span className="arena-kicker">COMPETITIVE NETWORK</span><strong>{pathname.startsWith("/admin")?"SCOUTING HQ":pathname==="/messages"?"COMMS CENTER":pathname==="/"?"LIVE ASSESSMENT":pathname==="/profile"?"PLAYER IDENTITY":"COMMAND CENTER"}</strong></div><div className="arena-top-actions"><Link href="/messages">Inbox</Link><Link href="/profile">Profile</Link></div></header><div className="arena-page">{children}</div></div><nav className="arena-mobile-nav">{items.slice(0,5).map(([href,label])=><Link key={href} href={href} className={pathname===href?"active":""}><span>{label.slice(0,1)}</span>{label}</Link>)}</nav></div>
}
