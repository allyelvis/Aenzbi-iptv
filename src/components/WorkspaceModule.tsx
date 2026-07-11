import React, { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { googleSignIn, logout, getAccessToken } from "../lib/googleAuth";
import { Guest } from "../types";
import { 
  Mail, Calendar, Send, Plus, Search, LogOut, Check, RefreshCw, 
  AlertCircle, ShieldCheck, Clock, User, Link2, ExternalLink, CalendarDays,
  FileCheck, Sparkles
} from "lucide-react";

interface WorkspaceModuleProps {
  guests: Guest[];
  onAddLog?: (severity: string, module: string, message: string) => void;
}

interface GmailMessage {
  id: string;
  snippet: string;
  from: string;
  subject: string;
  date: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export default function WorkspaceModule({ guests, onAddLog }: WorkspaceModuleProps) {
  // Auth state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active sub-tab inside workspace: "gmail" or "calendar"
  const [subTab, setSubTab] = useState<"gmail" | "calendar">("calendar");

  // Gmail States
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [emailSearch, setEmailSearch] = useState("hospitality OR feedback OR guest");
  
  // Compose Email States
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Calendar States
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  // Create Event States
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [eventStartTime, setEventStartTime] = useState("14:00");
  const [eventEndTime, setEventEndTime] = useState("15:00");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventSuccess, setEventSuccess] = useState(false);

  // Confirmation Modals
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    type: "email" | "calendar" | "sync_guest";
    title: string;
    description: string;
    payload: any;
  } | null>(null);

  // Initialize and check cached token
  useEffect(() => {
    // Check if we have an active token from googleAuth module
    const checkToken = async () => {
      const activeToken = await getAccessToken();
      if (activeToken) {
        setToken(activeToken);
        // We can check if Firebase Auth has a user currently
        const { getAuth } = await import("firebase/auth");
        const fbAuth = getAuth();
        if (fbAuth.currentUser) {
          setUser(fbAuth.currentUser);
        }
      }
    };
    checkToken();
  }, []);

  // Fetch Google Workspace Data once token is available
  useEffect(() => {
    if (token) {
      fetchCalendarEvents();
      fetchGmailMessages();
    }
  }, [token]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        if (onAddLog) {
          onAddLog("security", "Workspace OAuth", `User ${result.user.email} successfully logged in to Google Workspace.`);
        }
      }
    } catch (err: any) {
      console.error("Google sign in failed:", err);
      setAuthError(err.message || "Failed to authenticate with Google. Ensure popups are allowed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setEmails([]);
      setEvents([]);
      if (onAddLog) {
        onAddLog("security", "Workspace OAuth", "User logged out of Google Workspace.");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // -------------------------------------------------------------
  // GMAIL API INTEGRATION
  // -------------------------------------------------------------
  const fetchGmailMessages = async () => {
    if (!token) return;
    setLoadingEmails(true);
    setGmailError(null);
    try {
      const queryParam = emailSearch ? `&q=${encodeURIComponent(emailSearch)}` : "";
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8${queryParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!listRes.ok) {
        if (listRes.status === 401 || listRes.status === 403) {
          handleTokenExpiration();
          throw new Error("Google Workspace authentication expired or permissions are missing. Please reconnect your account.");
        }
        throw new Error(`Gmail API list failed: ${listRes.status} ${listRes.statusText || ""}`);
      }

      const listData = await listRes.json();
      if (!listData.messages || listData.messages.length === 0) {
        setEmails([]);
        setLoadingEmails(false);
        return;
      }

      // Fetch details in parallel
      const detailPromises = listData.messages.map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!detailRes.ok) return null;
        return detailRes.json();
      });

      const rawDetails = await Promise.all(detailPromises);
      const parsedEmails: GmailMessage[] = rawDetails
        .filter((d) => d !== null)
        .map((message: any) => {
          const headers = message.payload.headers;
          const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
          const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
          const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";
          return {
            id: message.id,
            snippet: message.snippet,
            from,
            subject,
            date,
          };
        });

      setEmails(parsedEmails);
    } catch (err: any) {
      console.error("Error fetching Gmail messages:", err);
      setGmailError(err.message || "Could not retrieve emails.");
    } finally {
      setLoadingEmails(false);
    }
  };

  const makeMime = (to: string, subject: string, body: string) => {
    const cleanSubject = subject || "Hotel Services Update";
    const str = [
      `To: ${to}`,
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(cleanSubject)))}?=`,
      "",
      `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 25px; background-color: #f8fafc; border-radius: 12px; color: #334155; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4f46e5; padding: 15px 25px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Luxor Grand Resorts & Spas</h2>
        </div>
        <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
          <p style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${body}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin: 0;">
            This email was sent on behalf of Luxor Grand Resorts & Spas Hospitality Guest Services.<br/>
            For immediate room concierge or IPTV configurations, please dial '0' from your room phone.
          </p>
        </div>
      </div>
      `
    ].join("\r\n");

    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const executeSendEmail = async (to: string, subject: string, body: string) => {
    if (!token) return;
    setSendingEmail(true);
    setEmailSuccess(false);
    try {
      const rawMime = makeMime(to, subject, body);
      const res = await fetch(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: rawMime }),
        }
      );

      if (!res.ok) {
        throw new Error(`Gmail send failed: ${res.statusText}`);
      }

      setEmailSuccess(true);
      setEmailBody("");
      setEmailSubject("");
      if (onAddLog) {
        onAddLog("info", "Gmail Sync", `Email notification dispatched to ${to} for topic: "${subject}"`);
      }
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error sending email:", err);
      alert(err.message || "Failed to dispatch email.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendEmailRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailBody) return;

    // Trigger explicit Workspace mutation confirmation
    setConfirmModal({
      show: true,
      type: "email",
      title: "Confirm Email Dispatch via Gmail",
      description: `You are about to send an email to ${emailTo} using your connected Google Workspace Account (${user?.email}).`,
      payload: { to: emailTo, subject: emailSubject, body: emailBody }
    });
  };

  // -------------------------------------------------------------
  // GOOGLE CALENDAR API INTEGRATION
  // -------------------------------------------------------------
  const fetchCalendarEvents = async () => {
    if (!token) return;
    setLoadingEvents(true);
    setCalendarError(null);
    try {
      const now = new Date().toISOString();
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=${now}&maxResults=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleTokenExpiration();
          throw new Error("Google Workspace authentication expired or permissions are missing. Please reconnect your account.");
        }
        throw new Error(`Calendar API failed: ${res.status} ${res.statusText || ""}`);
      }

      const data = await res.json();
      setEvents(data.items || []);
    } catch (err: any) {
      console.error("Error fetching Calendar events:", err);
      setCalendarError(err.message || "Could not retrieve calendar entries.");
    } finally {
      setLoadingEvents(false);
    }
  };

  const executeCreateEvent = async (title: string, desc: string, startDateTime: string, endDateTime: string) => {
    if (!token) return;
    setCreatingEvent(true);
    setEventSuccess(false);
    try {
      const eventPayload = {
        summary: title,
        description: desc,
        start: { dateTime: startDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
        end: { dateTime: endDateTime, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      };

      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventPayload),
        }
      );

      if (!res.ok) {
        throw new Error(`Calendar insert failed: ${res.statusText}`);
      }

      setEventSuccess(true);
      setEventTitle("");
      setEventDesc("");
      fetchCalendarEvents();
      if (onAddLog) {
        onAddLog("info", "Google Calendar Sync", `New hospitality calendar item created: "${title}"`);
      }
      setTimeout(() => setEventSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error creating calendar event:", err);
      alert(err.message || "Failed to create calendar event.");
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleCreateEventRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;

    const startDateTime = `${eventDate}T${eventStartTime}:00`;
    const endDateTime = `${eventDate}T${eventEndTime}:00`;

    // Trigger explicit Workspace mutation confirmation
    setConfirmModal({
      show: true,
      type: "calendar",
      title: "Confirm Google Calendar Event Addition",
      description: `This will insert a new calendar entry titled "${eventTitle}" for ${eventDate} at ${eventStartTime} into your primary Google Calendar (${user?.email}).`,
      payload: { title: eventTitle, desc: eventDesc, start: startDateTime, end: endDateTime }
    });
  };

  const handleSyncGuestToCalendar = (guest: Guest) => {
    const title = `Resort Stay: ${guest.name} (Room ${guest.roomNumber})`;
    const desc = `Guest Stay Details:\nName: ${guest.name}\nRoom: ${guest.roomNumber}\nLanguage: ${guest.language.toUpperCase()}\nPhone: ${guest.phone}\nCheckout Schedule: ${guest.checkOutDate}`;
    
    // Set stay date details for calendar entry
    const checkInDateISO = `${guest.checkInDate}T14:00:00`;
    const checkOutDateISO = `${guest.checkOutDate}T11:00:00`;

    setConfirmModal({
      show: true,
      type: "sync_guest",
      title: "Confirm Guest PMS Sync to Google Calendar",
      description: `You are about to sync the hotel booking for ${guest.name} (Room ${guest.roomNumber}) into your primary Google Calendar from ${guest.checkInDate} to ${guest.checkOutDate}.`,
      payload: { title, desc, start: checkInDateISO, end: checkOutDateISO, guestId: guest.id }
    });
  };

  const handleConfirmModalAction = () => {
    if (!confirmModal) return;
    const { type, payload } = confirmModal;
    setConfirmModal(null);

    if (type === "email") {
      executeSendEmail(payload.to, payload.subject, payload.body);
    } else if (type === "calendar") {
      executeCreateEvent(payload.title, payload.desc, payload.start, payload.end);
    } else if (type === "sync_guest") {
      executeCreateEvent(payload.title, payload.desc, payload.start, payload.end);
    }
  };

  const handleTokenExpiration = () => {
    // Clear out session token if expired or invalid
    setToken(null);
    setUser(null);
  };

  // Login render view
  if (!token) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-6 my-10" id="google-auth-login-screen">
        <div className="mx-auto w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Connect Google Workspace Hub</h2>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Sync guests checks-in to Google Calendar, dispatch guest ledger invoices via Gmail, and monitor feedback inbox folders directly from the Aenzbi IPTV Suite.
          </p>
        </div>

        {authError && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-lg flex items-start gap-2.5 text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <div className="pt-4 flex justify-center">
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-3.5 px-6 py-3 border border-slate-300 rounded-xl shadow-sm text-sm font-semibold bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer hover:border-indigo-300 hover:shadow-indigo-50 disabled:opacity-50"
            id="gsi-sign-in-button"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span>{isLoggingIn ? "Authorizing Google Account..." : "Connect Google Account"}</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Uses official Google API integration with securely scoped OAuth 2.0 permissions.
        </div>
      </div>
    );
  }

  // Active integration workspace
  return (
    <div className="space-y-6" id="workspace-sync-hub">
      {/* Sync hub top banner user profile */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3.5">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="h-12 w-12 rounded-full border-2 border-indigo-100 shadow-sm referrer-policy" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-12 w-12 bg-indigo-600 text-white font-extrabold rounded-full flex items-center justify-center text-sm">
              {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : "GW"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base">{user?.displayName || "Google Workspace Admin"}</h3>
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold rounded-full flex items-center gap-1">
                <ShieldCheck className="h-2.5 w-2.5" />
                Linked Account
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={handleLogout}
            className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 hover:border-red-200 hover:text-red-600 bg-white hover:bg-red-50 text-slate-600 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Disconnect Hub
          </button>
        </div>
      </div>

      {/* Primary Workspace Nav Sub-tabs */}
      <div className="flex border-b border-slate-200 gap-1 select-none">
        <button
          onClick={() => setSubTab("calendar")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "calendar" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Google Calendar Operations
        </button>
        <button
          onClick={() => setSubTab("gmail")}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            subTab === "gmail" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mail className="h-4 w-4" />
          Gmail Guest Deliveries
        </button>
      </div>

      {/* SUB-TAB 1: CALENDAR OPERATIONS */}
      {subTab === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Create new event form */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              Schedule Hospitality Event
            </h3>

            <form onSubmit={handleCreateEventRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Event Summary *</label>
                <input
                  type="text"
                  placeholder="e.g., VIP Guest Airport Pickup"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Stay Description / Notes</label>
                <textarea
                  placeholder="e.g., Room 101, Champagne package included."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full h-20 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-slate-500 font-semibold mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 text-[11px]"
                  />
                </div>
              </div>

              {eventSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Calendar event successfully created!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={creatingEvent || !eventTitle}
                className="w-full py-2.5 font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {creatingEvent ? "Inserting Event..." : "Add to Google Calendar"}
              </button>
            </form>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono block mb-2">Sync checked-in Guests</span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {guests.filter(g => g.status === "checked-in").map((guest) => (
                  <div key={guest.id} className="p-2.5 border border-slate-200/60 rounded-lg hover:border-slate-300 flex items-center justify-between text-xs transition-colors">
                    <div>
                      <span className="font-semibold text-slate-700">{guest.name}</span>
                      <span className="block text-[10px] text-slate-400">Room {guest.roomNumber} • Checkout: {guest.checkOutDate}</span>
                    </div>
                    <button
                      onClick={() => handleSyncGuestToCalendar(guest)}
                      className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded font-bold border border-slate-200 hover:border-indigo-200 text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Sync
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List existing Calendar events */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Upcoming Connected Schedule
              </h3>
              <button
                onClick={fetchCalendarEvents}
                disabled={loadingEvents}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                title="Refresh Calendar"
              >
                <RefreshCw className={`h-4 w-4 ${loadingEvents ? "animate-spin" : ""}`} />
              </button>
            </div>

            {calendarError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-lg">
                {calendarError}
              </div>
            )}

            {loadingEvents ? (
              <div className="h-48 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                <span>Syncing live calendar schedule...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="h-48 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 space-y-2">
                <Calendar className="h-8 w-8 text-slate-300" />
                <span className="font-semibold text-slate-600">No upcoming events found</span>
                <p className="max-w-xs text-[11px] text-slate-400">Events scheduled in your primary Google Calendar will sync and appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {events.map((evt) => {
                  const startStr = evt.start.dateTime || evt.start.date || "";
                  const dateObj = new Date(startStr);
                  const formattedDate = isNaN(dateObj.getTime()) ? startStr : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  const formattedTime = evt.start.dateTime ? dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "All Day";

                  return (
                    <div key={evt.id} className="bg-slate-50/40 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-3.5 rounded-xl flex items-start gap-3.5 transition-all">
                      <div className="px-2.5 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-center font-bold text-[10px] font-mono shrink-0 min-w-[50px]">
                        <span className="block text-[8px] uppercase tracking-wider text-indigo-400">Date</span>
                        {dateObj.toLocaleDateString("en-US", { day: "numeric" })} {dateObj.toLocaleDateString("en-US", { month: "short" })}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-800 text-xs truncate flex items-center justify-between gap-2">
                          <span className="truncate">{evt.summary}</span>
                          {evt.htmlLink && (
                            <a
                              href={evt.htmlLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 shrink-0 inline-flex items-center gap-0.5 font-normal text-[9px]"
                            >
                              Open <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </h4>
                        {evt.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed bg-white border border-slate-100 p-1.5 rounded-lg">{evt.description}</p>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono font-medium mt-2">
                          <Clock className="h-3 w-3" />
                          {formattedTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: GMAIL GUEST DELIVERIES */}
      {subTab === "gmail" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Dispatch hotel email / template */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Send className="h-4 w-4 text-indigo-600" />
              Dispatch Room Notification / Folio Invoice
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Select Guest Recipient</label>
                <select
                  onChange={(e) => {
                    const guest = guests.find((g) => g.id === e.target.value);
                    if (guest) {
                      setEmailTo(guest.email);
                      setEmailSubject(`Official Stay Summary & Updates - Room ${guest.roomNumber}`);
                      setEmailBody(`Dear ${guest.name},\n\nThank you for choosing Luxor Grand Resorts & Spas!\n\nWe hope you are thoroughly enjoying your stay in Room ${guest.roomNumber}.\n\nBelow, you will find your current folio activity and active resort listings:\n- Complimentary Premium IPTV: ONLINE\n- Smart Room Climate Control: OPTIMIZED\n\nStandard Check-out is scheduled on ${guest.checkOutDate} at 11:00 AM.\n\nWarmest regards,\nGuest Hospitality Management Team`);
                    } else {
                      setEmailTo("");
                      setEmailSubject("");
                      setEmailBody("");
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                >
                  <option value="">-- Choose active checked-in guest --</option>
                  {guests.filter(g => g.status === "checked-in").map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.name} (Room {guest.roomNumber} - {guest.email})
                    </option>
                  ))}
                </select>
              </div>

              <form onSubmit={handleSendEmailRequest} className="space-y-3.5">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Recipient Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g., guest@example.com"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Subject Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Guest Room Reservation Invoice"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Email HTML Body Content *</label>
                  <textarea
                    required
                    placeholder="Provide email letter body..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full h-40 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 resize-none font-sans leading-relaxed"
                  />
                </div>

                {emailSuccess && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Email notification dispatched via Gmail API!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sendingEmail || !emailTo || !emailBody}
                  className="w-full py-2.5 font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendingEmail ? "Dispatching via Gmail..." : "Send Guest Email"}
                </button>
              </form>
            </div>
          </div>

          {/* List feedback / emails in folder */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Mail className="h-4 w-4 text-indigo-600" />
                Hotel Feedback & Inquiries folder
              </h3>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter folders..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchGmailMessages();
                    }}
                    className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs w-full sm:w-56 bg-slate-50/50"
                  />
                </div>
                <button
                  onClick={fetchGmailMessages}
                  disabled={loadingEmails}
                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingEmails ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {gmailError && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-lg">
                {gmailError}
              </div>
            )}

            {loadingEmails ? (
              <div className="h-48 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
                <span>Reading folder and mapping snippets...</span>
              </div>
            ) : emails.length === 0 ? (
              <div className="h-48 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 space-y-2">
                <Mail className="h-8 w-8 text-slate-300" />
                <span className="font-semibold text-slate-600">No synchronized letters found</span>
                <p className="max-w-xs text-[11px] text-slate-400">Emails matching query <strong>"{emailSearch}"</strong> in your connected inbox will appear here automatically.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {emails.map((email) => (
                  <div key={email.id} className="bg-slate-50/40 hover:bg-slate-50 border border-slate-200/60 hover:border-slate-300 p-3.5 rounded-xl flex flex-col gap-1 transition-all text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-700 block truncate">{email.from}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{email.date}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[8px] font-bold rounded-mono uppercase font-mono">
                        Inbox
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-800 text-xs mt-1.5">{email.subject}</h4>
                    <p className="text-[11px] text-slate-500 bg-white border border-slate-100/80 p-2.5 rounded-lg leading-relaxed mt-1">{email.snippet}</p>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          const match = email.from.match(/<(.+?)>/) || email.from.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                          const address = match ? match[1] : email.from;
                          setEmailTo(address);
                          setEmailSubject(`Re: ${email.subject.replace(/^Re:\s*/i, "")}`);
                          setEmailBody(`Dear Guest,\n\nThank you for reaching out to Luxor Grand Resorts Guest Services.\n\nRegarding your request:\n"${email.snippet.substring(0, 100)}..."\n\nOur service desk is currently looking into this and will provide a formal resolution within 10 minutes.\n\nWarmest regards,\nLuxor Grand Guest Desk`);
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 text-[10px] rounded font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      >
                        <Send className="h-3 w-3" />
                        Reply Letter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION MUTATION DIALOG MODAL (Strictly compliant with Google Workspace SDK rules) */}
      {confirmModal && confirmModal.show && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in text-xs" id="workspace-confirmation-modal">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-slate-800">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                {confirmModal.type === "email" ? <Mail className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <h3 className="font-extrabold text-base text-slate-800">{confirmModal.title}</h3>
            </div>

            <div className="space-y-3">
              <p className="text-slate-500 font-medium leading-relaxed">{confirmModal.description}</p>
              
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-slate-600">
                {confirmModal.type === "email" && (
                  <>
                    <div>
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Recipient</span>
                      <span className="font-semibold text-slate-700">{confirmModal.payload.to}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Subject</span>
                      <span className="font-bold text-slate-800">{confirmModal.payload.subject}</span>
                    </div>
                  </>
                )}

                {(confirmModal.type === "calendar" || confirmModal.type === "sync_guest") && (
                  <>
                    <div>
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Event Summary</span>
                      <span className="font-bold text-slate-800">{confirmModal.payload.title}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Scheduled Start</span>
                      <span className="font-mono text-indigo-700 font-semibold">{new Date(confirmModal.payload.start).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-500 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModalAction}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-extrabold shadow-sm shadow-indigo-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                Confirm & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
