"use client";

import { useEffect, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";

export default function VoiceChat({ inviteId, otherName, onLeave }: { inviteId: string; otherName: string; onLeave: () => void }) {
  const roomRef = useRef<Room | null>(null);
  const [connected, setConnected] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState("");
  const [otherHere, setOtherHere] = useState(false);

  useEffect(() => {
    let mounted = true;
    const start = async () => {
      try {
        const response = await fetch("/api/voice-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteId }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Unable to start voice chat.");
        const room = new Room();
        roomRef.current = room;
        room.on(RoomEvent.ParticipantConnected, () => mounted && setOtherHere(true));
        room.on(RoomEvent.ParticipantDisconnected, () => mounted && setOtherHere(false));
        room.on(RoomEvent.TrackSubscribed, (track) => { if (track.kind === Track.Kind.Audio) track.attach(); });
        await room.connect(data.url, data.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (mounted) { setConnected(true); setOtherHere(room.remoteParticipants.size > 0); }
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : "Unable to start voice chat."); }
    };
    void start();
    return () => { mounted = false; roomRef.current?.disconnect(); roomRef.current = null; };
  }, [inviteId]);

  const toggleMute = async () => {
    const next = !muted;
    await roomRef.current?.localParticipant.setMicrophoneEnabled(!next);
    setMuted(next);
  };
  const leave = () => { roomRef.current?.disconnect(); roomRef.current = null; onLeave(); };

  return <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl">
    <div className="flex items-center justify-between gap-3"><div><p className="font-black">🎮 Voice chat</p><p className="text-xs text-zinc-500 mt-1">{connected ? (otherHere ? `Connected with ${otherName}` : `Waiting for ${otherName}...`) : error || "Connecting..."}</p></div><span className={`h-3 w-3 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`} /></div>
    {error ? <button onClick={onLeave} className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 font-black">CLOSE</button> : <div className="mt-4 flex gap-2"><button onClick={()=>void toggleMute()} className="flex-1 rounded-xl border border-zinc-700 px-4 py-3 font-bold">{muted ? "UNMUTE" : "MUTE"}</button><button onClick={leave} className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-black">LEAVE</button></div>}
  </div>;
}
