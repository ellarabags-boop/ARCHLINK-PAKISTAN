import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function ChatInbox() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/chat/conversations", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Unable to load conversations."); return data; })
      .then((data) => setConversations(data.conversations || []))
      .catch((err) => setError(err.message));
  }, [token]);
  return <main className="section"><div className="page-intro"><p className="small-label">MESSAGES</p><h1>Conversations</h1><p>Message clients and service providers directly inside ArchLink Pakistan.</p></div>{error && <p className="error-message">{error}</p>}{conversations.length === 0 && !error ? <div className="empty-state"><h3>No conversations yet</h3><p>Chat becomes available for active, non-rejected service requests.</p><Link className="primary-btn button-link" to={user?.role === "provider" ? "/provider-dashboard" : "/my-requests"}>View Service Requests</Link></div> : <div className="chat-conversation-list">{conversations.map((item) => { const other = user?.role === "provider" ? item.client : item.provider; return <Link className="chat-conversation-card" to={`/chat/${item._id}`} key={item._id}><div><strong>{item.service?.title || "Service Request"}</strong><p>{other?.name || "Conversation participant"}</p><small>Request status: {item.status}</small></div><span>Open chat →</span></Link>; })}</div>}</main>;
}

export default function Chat() {
  const { requestId } = useParams();
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [connection, setConnection] = useState("Connecting...");
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const seenRef = useRef(new Set());

  const loadMessages = useCallback(async () => {
    const response = await fetch(`/api/chat/${requestId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load messages.");
    setMessages(data.messages || []);
    (data.messages || []).forEach((message) => seenRef.current.add(message._id));
  }, [requestId, token]);

  useEffect(() => {
    loadMessages().catch((err) => setError(err.message));
    const socket = io(SOCKET_URL, { auth: { token }, transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => { setConnection("Live"); socket.emit("chat:join", requestId, (result) => { if (!result?.ok) setError(result?.message || "Unable to join chat."); }); });
    socket.on("disconnect", () => setConnection("Reconnecting..."));
    socket.on("connect_error", () => setConnection("Offline — checking connection"));
    socket.on("chat:new-message", (message) => {
      if (String(message.serviceRequest) !== String(requestId) || seenRef.current.has(message._id)) return;
      seenRef.current.add(message._id);
      setMessages((current) => [...current, message]);
    });
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [loadMessages, requestId, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch(`/api/chat/${requestId}/messages`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ text: messageText }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to send message.");
      if (!seenRef.current.has(data.message._id)) { seenRef.current.add(data.message._id); setMessages((current) => [...current, data.message]); }
      setText("");
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  };

  return <main className="section chat-page"><div className="chat-header"><div><p className="small-label">SERVICE REQUEST CHAT</p><h1>Live Conversation</h1><p>Messages are saved to your account history.</p></div><div><span className={`chat-connection ${connection === "Live" ? "is-live" : ""}`}>{connection}</span><Link to="/chat-inbox" className="secondary-btn button-link">All Conversations</Link></div></div>{error && <p role="alert" className="error-message">{error}</p>}<section className="chat-message-panel" aria-live="polite">{messages.length === 0 ? <div className="empty-state"><p>No messages yet. Send the first message to begin.</p></div> : messages.map((message) => { const own = String(message.sender?._id || message.sender) === String(user?._id || user?.id || user?.userId); return <article className={`chat-message ${own ? "chat-message-own" : ""}`} key={message._id}><div className="chat-message-meta"><strong>{own ? "You" : (message.sender?.name || "Participant")}</strong><time>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}</time></div><p>{message.text}</p></article>; })}<div ref={bottomRef} /></section><form className="chat-compose" onSubmit={sendMessage}><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." maxLength={3000} rows={3} required /><button className="primary-btn" disabled={sending || !text.trim()}>{sending ? "Sending..." : "Send Message"}</button></form></main>;
}
