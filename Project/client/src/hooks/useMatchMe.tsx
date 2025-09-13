import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

/**
 * Types
 */
export type UserProfile = {
  id: string;
  username?: string;
  skills: string[];
  availability?: string[];
  metadata?: Record<string, any>;
};

export type MatchItem = {
  userId: string;
  username?: string;
  score: number;
  sharedSkills: string[];
  sharedAvailability?: string[];
};

type ServerToClientEvents = {
  matchUpdate: (matches: MatchItem[]) => void;
  matched: (session: { sessionId: string; a: UserProfile; b: UserProfile }) => void;
  notification: (msg: string) => void;
};

type ClientToServerEvents = {
  joinQueue: (profile: UserProfile) => void;
  leaveQueue: (userId: string) => void;
  updateProfile: (profile: UserProfile) => void;
  requestManualMatch: (userId: string) => void;
  acceptMatch: (payload: { inviterId: string; acceptorId: string }) => void;
};

const SOCKET_URL = import.meta.env.VITE_MATCHING_SOCKET ?? "http://localhost:4000";

export function useMatchMe(initialProfile: UserProfile | null) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [topMatch, setTopMatch] = useState<MatchItem | null>(null);
  const [isQueued, setIsQueued] = useState(false);
  const [isAutoMatch, setIsAutoMatch] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const profileRef = useRef<UserProfile | null>(initialProfile);

  useEffect(() => {
    profileRef.current = initialProfile;
  }, [initialProfile]);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    s.on("connect", () => {
      pushNotif("Connected to match server.");
      if (profileRef.current && isAutoMatch) {
        s.emit("joinQueue", profileRef.current);
        setIsQueued(true);
      }
    });

    s.on("matchUpdate", (m) => {
      setMatches(m);
      setTopMatch(m[0] ?? null);
    });

    s.on("matched", (session) => {
      pushNotif(`Matched with ${session.b.username ?? session.b.id}. Session: ${session.sessionId}`);
      setIsQueued(false);
      setIsAutoMatch(false);
    });

    s.on("notification", (msg) => pushNotif(msg));

    s.connect();
    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, []);

  function pushNotif(msg: string) {
    setNotifications((prev) => [msg, ...prev].slice(0, 10));
  }

  function startAutoMatch() {
    if (!socket || !profileRef.current) {
      pushNotif("No profile or server connection.");
      return;
    }
    setIsAutoMatch(true);
    socket.emit("joinQueue", profileRef.current);
    setIsQueued(true);
    pushNotif("Auto-match started — searching for matches...");
  }

  function stopAutoMatch() {
    if (!socket || !profileRef.current) return;
    socket.emit("leaveQueue", profileRef.current.id);
    setIsAutoMatch(false);
    setIsQueued(false);
    pushNotif("Auto-match stopped.");
  }

  function manualRequestMatch() {
    if (!socket || !profileRef.current) return;
    socket.emit("requestManualMatch", profileRef.current.id);
    pushNotif("Manual match requested.");
  }

  function updateProfile(profile: UserProfile) {
    profileRef.current = profile;
    if (socket) socket.emit("updateProfile", profile);
  }

  function acceptTopMatch() {
    if (!socket || !profileRef.current || !topMatch) return;
    socket.emit("acceptMatch", { inviterId: topMatch.userId, acceptorId: profileRef.current.id });
    pushNotif(`Accepted match with ${topMatch.username ?? topMatch.userId}`);
  }

  return {
    socket,
    matches,
    topMatch,
    isQueued,
    isAutoMatch,
    notifications,
    startAutoMatch,
    stopAutoMatch,
    manualRequestMatch,
    acceptTopMatch,
    updateProfile,
  };
}