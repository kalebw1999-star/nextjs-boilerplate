"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Person = { id: string; username: string; status: "none" | "waiting" | "team"; teamId: string | null; hasTest?: boolean; isRecruiter: boolean };
type Conversation = { threadId: string; approvalStatus: string; userId: string; username: string; lastBody: string | null; lastCreatedAt: string | null };
type Message = { id: string; sender_id: string; sender_username: string; body: string; created_at: string };
type Request = { threadId: string; userId: string; username: string; body: string; requestedAt: string; createdAt: string };

const statusLabel = (person: Person) => person.isRecruiter ? "RECRUITER" : person.status === "waiting" ? "WAITING ROOM" : person.status === "team" ? "TEAM" : "PLAYER";

export default function MessagesPage() {
  const router = useRouter();
  const [me, setMe] = useState<Person | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [approvalStatus, setApprovalStatus] = useState("active");
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const selected = useMemo(() => people.find((person) => person.id === selectedId) ?? null, [people, selectedId]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [baseResponse, directoryResponse] = await Promise.all([
        fetch("/api/messages", { cache: "no-store" }),
        fetch("/api/messages?directory=1", { cache: "no-store" }),
      ]);
      const base = await baseResponse.json();
      if (baseResponse.status === 401) { router.replace("/login"); return; }
      if (!baseResponse.ok) throw new Error(base.error ?? "Unable to load messages.");
      const directory = await directoryResponse.json();
      setMe(base.me); setConversations(base.conversations ?? []); setPeople(directory.users ?? []);
      if (base.me?.isRecruiter) {
        const requestResponse = await fetch("/api/messages?requests=1", { cache: "no-store" });
        const requestData = await requestResponse.json();
        if (requestResponse.ok) setRequests(requestData.requests ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages.");
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const openConversation = useCallback(async (userId: string) => {
    setSelectedId(userId); setError("");
    try {
      const response = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load conversation.");
      setMessages(data.messages ?? []); setApprovalStatus(data.thread?.approvalStatus ?? "active");
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load conversation."); }
  }, []);

  async function sendMessage() {
    if (!selected || !draft.trim() || sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: selected.id, message: draft }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send message.");
      setDraft(""); setApprovalStatus(data.approvalStatus ?? "active"); await openConversation(selected.id); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to send message."); }
    finally { setSending(false); }
  }

  async function updateRequest(threadId: string, action: "approve" | "reject") {
    setError("");
    try {
      const response = await fetch("/api/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ threadId, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update request.");
      setRequests((current) => current.filter((item) => item.threadId !== threadId));
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update request."); }
  }

  const filteredPeople = people.filter((person) => person.username.toLowerCase().includes(search.trim().toLowerCase()));
  const conversationIds = new Set(conversations.map((conversation) => conversation.userId));

  if (loading) return <main className="min-h-screen bg-black text-white flex items-center justify-center">Loading messages...</main>;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div><p className="text-xs font-black tracking-[.3em] text-red-500">CODIQ</p><h1 className="text-4xl font-black mt-2">MESSAGES</h1><p className="text-zinc-500 mt-2">Private player and recruiter conversations.</p></div>
          <Link href="/dashboard" className="rounded-xl border border-zinc-800 px-5 py-3 font-bold text-center">DASHBOARD</Link>
        </header>

        {error && <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-red-400">{error}</div>}

        {me?.isRecruiter && requests.length > 0 && <section className="mb-5 rounded-2xl border border-yellow-900/40 bg-yellow-950/10 p-5"><p className="text-xs font-black tracking-[.2em] text-yellow-500">RECRUITER APPROVALS</p><h2 className="text-xl font-black mt-1">New message requests</h2><div className="space-y-3 mt-4">{requests.map((item) => <div key={item.threadId} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><p className="font-black">{item.username}</p><p className="text-sm text-zinc-400 mt-1">{item.body}</p><p className="text-xs text-zinc-600 mt-2">{new Date(item.requestedAt).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => void updateRequest(item.threadId, "reject")} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-bold">REJECT</button><button onClick={() => void updateRequest(item.threadId, "approve")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-black">APPROVE</button></div></div></div>)}</div></section>}

        <section className="grid lg:grid-cols-[300px_1fr] min-h-[650px] rounded-3xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <aside className="border-b lg:border-b-0 lg:border-r border-zinc-800">
            <div className="p-4 border-b border-zinc-800"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a player..." className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500" /></div>
            <div className="max-h-[590px] overflow-y-auto">{filteredPeople.map((person) => <button key={person.id} onClick={() => void openConversation(person.id)} className={`w-full text-left p-4 border-b border-zinc-900 hover:bg-zinc-900/70 ${selectedId === person.id ? "bg-zinc-900" : ""}`}><div className="flex items-center justify-between gap-2"><span className="font-black">{person.username}</span>{conversationIds.has(person.id) ? <span className="h-2 w-2 rounded-full bg-red-500" /> : null}</div><p className="text-xs text-zinc-600 mt-1">{statusLabel(person)}</p></button>)}{!filteredPeople.length && <p className="p-6 text-sm text-zinc-600">No eligible players found.</p>}</div>
          </aside>

          <div className="flex flex-col min-h-[650px]">
            {!selected ? <div className="flex-1 flex items-center justify-center p-8 text-center"><div><p className="text-5xl">💬</p><h2 className="text-2xl font-black mt-4">Choose a conversation</h2><p className="text-zinc-600 mt-2 max-w-sm">Messaging unlocks after your first completed assessment.</p></div></div> : <>
              <div className="p-5 border-b border-zinc-800"><p className="text-xl font-black">{selected.username}</p><p className="text-xs text-zinc-600 mt-1">{statusLabel(selected)}{selected.teamId ? ` · ${selected.teamId}` : ""}</p></div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">{messages.length ? messages.map((message) => <div key={message.id} className={`flex ${message.sender_id === me?.id ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.sender_id === me?.id ? "bg-red-600" : "bg-zinc-900 border border-zinc-800"}`}><p className="text-xs font-bold opacity-60 mb-1">{message.sender_id === me?.id ? "YOU" : message.sender_username}</p><p className="whitespace-pre-wrap break-words">{message.body}</p><p className="text-[10px] opacity-50 mt-2">{new Date(message.created_at).toLocaleString()}</p></div></div>) : <div className="h-full flex items-center justify-center text-zinc-600">Start the conversation.</div>}</div>
              {approvalStatus === "pending" && !me?.isRecruiter && <div className="mx-5 mb-3 rounded-xl border border-yellow-900/50 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-400">Your first message is waiting for the recruiter to approve it. You cannot send another message until they approve it.</div>}
              {approvalStatus === "rejected" && <div className="mx-5 mb-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-500">This message request was rejected. You can request again after the short cooldown.</div>}
              <div className="p-4 border-t border-zinc-800 flex gap-3"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} disabled={approvalStatus === "pending" || sending} rows={2} maxLength={2000} placeholder={approvalStatus === "pending" ? "Waiting for approval..." : "Write a message..."} className="flex-1 resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none focus:border-red-500 disabled:opacity-50"/><button disabled={!draft.trim() || approvalStatus === "pending" || sending} onClick={() => void sendMessage()} className="self-end rounded-xl bg-red-600 px-5 py-3 font-black disabled:opacity-40">SEND</button></div>
            </>}
          </div>
        </section>
      </div>
    </main>
  );
}
