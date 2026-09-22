import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import LZString from 'lz-string';
import { initPeerSync, broadcastPeerState } from '../services/peerSync';

const AppContext = createContext();

export const formatTimeFormatted = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const DEFAULT_PARTNERS = [
  { id: 'socio_1', name: 'Socio 1 (Tú)', role: 'Co-Fundador', avatar: '🦁', color: '#D95338' },
  { id: 'socio_2', name: 'Socio 2 (Tu Socio)', role: 'Co-Fundador', avatar: '⚡', color: '#2E5A44' }
];

const DEFAULT_DAILY_SCHEDULE = {
  defaultHour: "10:00",
  durationMinutes: 45,
  days: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
  location: "Google Meet / Presencial",
  meetUrl: "https://meet.google.com/nuevo-enlace"
};

const TODAY = new Date().toISOString().split('T')[0];

// Build sync endpoint URL with cache-busting timestamp
const getSyncUrl = (wsId) => {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://socio-sync-three.vercel.app';
  return `${origin}/api/sync?workspaceId=${encodeURIComponent(wsId || 'colombia')}&_t=${Date.now()}`;
};

// Read a workspace's data from localStorage
const loadWorkspaceFromLocal = (wsId) => {
  const get = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  };

  const partners = get(`ss_${wsId}_partners`, DEFAULT_PARTNERS);
  const schedule = get(`ss_${wsId}_schedule`, DEFAULT_DAILY_SCHEDULE);
  const meetings = get(`ss_${wsId}_meetings`, [{
    id: 'meet-initial',
    title: 'Reunión Diaria de Sincronización',
    date: TODAY,
    time: schedule.defaultHour || '10:00',
    duration: 45,
    status: 'Programada',
    notes: 'Bienvenido a SocioSync.',
    meetUrl: schedule.meetUrl
  }]);
  const topics = get(`ss_${wsId}_topics`, []);
  const actionItems = get(`ss_${wsId}_actions`, []);
  const ideas = get(`ss_${wsId}_ideas`, []);
  const pin = localStorage.getItem(`ss_${wsId}_pin`) || '';
  const user = get(`ss_${wsId}_user`, partners[0] || DEFAULT_PARTNERS[0]);

  return { partners, schedule, meetings, topics, actionItems, ideas, pin, user };
};

// Save workspace state to localStorage
const saveWorkspaceToLocal = (wsId, state) => {
  try {
    if (state.partners) localStorage.setItem(`ss_${wsId}_partners`, JSON.stringify(state.partners));
    if (state.schedule) localStorage.setItem(`ss_${wsId}_schedule`, JSON.stringify(state.schedule));
    if (state.meetings) localStorage.setItem(`ss_${wsId}_meetings`, JSON.stringify(state.meetings));
    if (state.topics !== undefined) localStorage.setItem(`ss_${wsId}_topics`, JSON.stringify(state.topics));
    if (state.actionItems !== undefined) localStorage.setItem(`ss_${wsId}_actions`, JSON.stringify(state.actionItems));
    if (state.ideas !== undefined) localStorage.setItem(`ss_${wsId}_ideas`, JSON.stringify(state.ideas));
    if (state.pin !== undefined) localStorage.setItem(`ss_${wsId}_pin`, state.pin);
    if (state.user) localStorage.setItem(`ss_${wsId}_user`, JSON.stringify(state.user));
  } catch { }
};

export const AppProvider = ({ children }) => {
  // ─── Workspace ID ───────────────────────────────────────────────
  const [workspaceId, setWorkspaceId] = useState(() => {
    return localStorage.getItem('ss_current_workspace') || 'colombia';
  });

  // ─── Core workspace state ───────────────────────────────────────
  const initWs = loadWorkspaceFromLocal(workspaceId);

  const [partners, setPartners] = useState(initWs.partners);
  const [currentUser, setCurrentUser] = useState(initWs.user);
  const [dailySchedule, setDailySchedule] = useState(initWs.schedule);
  const [meetings, setMeetings] = useState(initWs.meetings);
  const [topics, setTopics] = useState(initWs.topics);
  const [actionItems, setActionItems] = useState(initWs.actionItems);
  const [ideas, setIdeas] = useState(initWs.ideas);
  const [activeMeetingId, setActiveMeetingId] = useState(initWs.meetings[0]?.id || 'meet-initial');

  // ─── PIN / Lock state ───────────────────────────────────────────
  const [workspacePin, setWorkspacePinState] = useState(initWs.pin);
  const [isLocked, setIsLocked] = useState(() => {
    const unlocked = sessionStorage.getItem(`ss_${workspaceId}_unlocked`);
    return initWs.pin ? unlocked !== 'true' : false;
  });

  // ─── Sync metadata ──────────────────────────────────────────────
  const [syncStatus, setSyncStatus] = useState('connected');
  const [lastSyncTime, setLastSyncTime] = useState('Reciente');
  const [savedWorkspaces, setSavedWorkspaces] = useState(() => {
    try {
      const raw = localStorage.getItem('ss_workspaces_list');
      if (raw) return JSON.parse(raw);
    } catch { }
    return ['colombia'];
  });

  // Refs for sync management
  const lastCloudTs = useRef(0);        // last timestamp received from cloud
  const isMutating = useRef(false);     // true while we are pushing our own change
  const activeWsRef = useRef(workspaceId); // always tracks current workspaceId

  // ─── Keep activeWsRef in sync ───────────────────────────────────
  useEffect(() => {
    activeWsRef.current = workspaceId;
  }, [workspaceId]);

  // ─── Persist state to localStorage whenever it changes ──────────
  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { partners });
  }, [partners, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { user: currentUser });
  }, [currentUser, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { schedule: dailySchedule });
  }, [dailySchedule, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { meetings });
  }, [meetings, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { topics });
  }, [topics, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { actionItems });
  }, [actionItems, workspaceId]);

  useEffect(() => {
    saveWorkspaceToLocal(workspaceId, { ideas });
  }, [ideas, workspaceId]);

  // ─── Load a full workspace state into React state ────────────────
  const applyWorkspaceState = useCallback((wsData) => {
    if (wsData.partners && wsData.partners.length > 0) setPartners(wsData.partners);
    if (wsData.dailySchedule) setDailySchedule(wsData.dailySchedule);
    if (wsData.meetings && wsData.meetings.length > 0) {
      setMeetings(wsData.meetings);
      setActiveMeetingId(wsData.meetings[0]?.id || 'meet-initial');
    }
    if (Array.isArray(wsData.topics)) setTopics(wsData.topics);
    if (Array.isArray(wsData.actionItems)) setActionItems(wsData.actionItems);
    if (Array.isArray(wsData.ideas)) setIdeas(wsData.ideas);
  }, []);

  // ─── Switch Workspace ────────────────────────────────────────────
  const switchWorkspace = useCallback((newWsId) => {
    const cleanId = newWsId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanId) return;

    // Save current workspace state before switching
    saveWorkspaceToLocal(workspaceId, {
      partners, schedule: dailySchedule, meetings, topics, actionItems, ideas
    });

    // Update workspace list
    if (!savedWorkspaces.includes(cleanId)) {
      const updatedList = [...savedWorkspaces, cleanId];
      setSavedWorkspaces(updatedList);
      localStorage.setItem('ss_workspaces_list', JSON.stringify(updatedList));
    }

    localStorage.setItem('ss_current_workspace', cleanId);
    setWorkspaceId(cleanId);

    // CRITICAL FIX: Reset the cloud timestamp so the new workspace
    // always fetches fresh data from cloud instead of being skipped
    lastCloudTs.current = 0;
    isMutating.current = false;

    // Load new workspace state from localStorage immediately (fast UI)
    const newWsData = loadWorkspaceFromLocal(cleanId);
    setPartners(newWsData.partners);
    setCurrentUser(newWsData.user || newWsData.partners[0] || DEFAULT_PARTNERS[0]);
    setDailySchedule(newWsData.schedule);
    setMeetings(newWsData.meetings);
    setTopics(newWsData.topics);
    setActionItems(newWsData.actionItems);
    setIdeas(newWsData.ideas);
    setActiveMeetingId(newWsData.meetings[0]?.id || 'meet-initial');

    // Load PIN for new workspace
    const newPin = localStorage.getItem(`ss_${cleanId}_pin`) || '';
    setWorkspacePinState(newPin);
    if (newPin) {
      const unlocked = sessionStorage.getItem(`ss_${cleanId}_unlocked`);
      setIsLocked(unlocked !== 'true');
    } else {
      setIsLocked(false);
    }

    // Immediately fetch from cloud for new workspace (async, will update state)
    setTimeout(() => {
      pullFromCloudForWorkspace(cleanId);
    }, 100);
  }, [workspaceId, savedWorkspaces, partners, dailySchedule, meetings, topics, actionItems, ideas]);

  // ─── Push to Cloud ────────────────────────────────────────────────
  const pushToCloud = useCallback(async (customPayload) => {
    const wsId = activeWsRef.current;
    const fullState = {
      workspaceId: wsId,
      pin: customPayload?.pin !== undefined ? customPayload.pin : workspacePin,
      partners: customPayload?.partners || partners,
      dailySchedule: customPayload?.dailySchedule || dailySchedule,
      meetings: customPayload?.meetings || meetings,
      topics: customPayload?.topics || topics,
      actionItems: customPayload?.actionItems || actionItems,
      ideas: customPayload?.ideas || ideas,
      ts: Date.now()
    };

    // Broadcast to WebRTC peers
    broadcastPeerState(fullState);

    try {
      setSyncStatus('syncing');
      isMutating.current = true;
      lastCloudTs.current = fullState.ts;

      await fetch(getSyncUrl(wsId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: wsId, data: fullState })
      });

      setSyncStatus('connected');
      const timeStr = new Date(fullState.ts).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      setLastSyncTime(timeStr);
    } catch (e) {
      console.warn('Cloud push error:', e);
      setSyncStatus('connected');
    } finally {
      setTimeout(() => { isMutating.current = false; }, 800);
    }
  }, [workspacePin, partners, dailySchedule, meetings, topics, actionItems, ideas]);

  // ─── Pull from Cloud for a specific workspace ─────────────────────
  const pullFromCloudForWorkspace = async (wsId) => {
    try {
      const res = await fetch(getSyncUrl(wsId), { cache: 'no-store' });
      if (!res.ok) return;
      const result = await res.json();
      const data = result?.data;

      if (!data || !data.ts) return;

      // CRITICAL: only apply if this response is for the CURRENTLY ACTIVE workspace
      if (activeWsRef.current !== wsId) return;

      if (data.pin !== undefined) {
        const cloudPin = String(data.pin || '').trim();
        setWorkspacePinState(cloudPin);
        localStorage.setItem(`ss_${wsId}_pin`, cloudPin);
        if (cloudPin) {
          const unlocked = sessionStorage.getItem(`ss_${wsId}_unlocked`);
          if (unlocked !== 'true') setIsLocked(true);
        }
      }

      applyWorkspaceState(data);
      lastCloudTs.current = data.ts;

      setSyncStatus('connected');
      const timeStr = new Date(data.ts).toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      setLastSyncTime(timeStr);

      // Also persist to localStorage
      saveWorkspaceToLocal(wsId, {
        partners: data.partners,
        schedule: data.dailySchedule,
        meetings: data.meetings,
        topics: data.topics,
        actionItems: data.actionItems,
        ideas: data.ideas,
        pin: data.pin !== undefined ? String(data.pin || '') : undefined
      });
    } catch (e) {
      setSyncStatus('connected');
    }
  };

  // ─── Regular Pull (polling) ────────────────────────────────────────
  const pullFromCloud = useCallback(async (force = false) => {
    if (isMutating.current && !force) return;
    await pullFromCloudForWorkspace(activeWsRef.current);
  }, [applyWorkspaceState]);

  // ─── Poll every 3 seconds ──────────────────────────────────────────
  useEffect(() => {
    // Always force-pull on first mount or workspace change
    pullFromCloudForWorkspace(workspaceId);
    const timer = setInterval(() => {
      if (!isMutating.current) {
        pullFromCloudForWorkspace(activeWsRef.current);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [workspaceId]);

  // ─── PeerJS WebRTC Sync ────────────────────────────────────────────
  useEffect(() => {
    initPeerSync(workspaceId, (payload) => {
      if (!payload) return;
      if (activeWsRef.current !== workspaceId) return;
      if (payload.pin !== undefined) {
        setWorkspacePinState(String(payload.pin || '').trim());
        localStorage.setItem(`ss_${workspaceId}_pin`, String(payload.pin || '').trim());
      }
      applyWorkspaceState(payload);
      setSyncStatus('connected');
    });
  }, [workspaceId]);

  // ─── URL Import on mount ────────────────────────────────────────────
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const importParam = params.get('importData');
      const wsParam = params.get('workspaceId');

      if (wsParam) {
        localStorage.setItem('ss_current_workspace', wsParam);
        setWorkspaceId(wsParam);
      }

      if (importParam) {
        const decompressed = LZString.decompressFromEncodedURIComponent(importParam);
        if (decompressed) {
          const payload = JSON.parse(decompressed);
          const targetWs = payload.workspaceId || wsParam || workspaceId;

          saveWorkspaceToLocal(targetWs, {
            partners: payload.partners,
            schedule: payload.dailySchedule,
            meetings: payload.meetings,
            topics: payload.topics,
            actionItems: payload.actionItems,
            ideas: payload.ideas,
            pin: payload.pin !== undefined ? String(payload.pin || '') : undefined
          });

          if (activeWsRef.current === targetWs) {
            applyWorkspaceState(payload);
            if (payload.pin !== undefined) {
              setWorkspacePinState(String(payload.pin || '').trim());
            }
          }

          window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
        }
      }
    } catch (e) {
      console.warn('URL Import error:', e);
    }
  }, []);

  // ─── PIN / Lock actions ────────────────────────────────────────────
  const unlockWorkspace = (inputPin, targetWsId = null) => {
    const wsId = targetWsId || activeWsRef.current;
    const currentPin = String(localStorage.getItem(`ss_${wsId}_pin`) || workspacePin || '').trim();
    if (!currentPin || String(inputPin).trim() === currentPin) {
      setIsLocked(false);
      sessionStorage.setItem(`ss_${wsId}_unlocked`, 'true');
      return true;
    }
    return false;
  };

  const lockWorkspace = (targetWsId = null) => {
    const wsId = targetWsId || activeWsRef.current;
    const pin = String(localStorage.getItem(`ss_${wsId}_pin`) || workspacePin || '').trim();
    if (pin) {
      setIsLocked(true);
      sessionStorage.removeItem(`ss_${wsId}_unlocked`);
    }
  };

  const updateWorkspacePin = (newPin) => {
    const cleanPin = newPin ? String(newPin).trim() : '';
    setWorkspacePinState(cleanPin);
    localStorage.setItem(`ss_${workspaceId}_pin`, cleanPin);
    if (!cleanPin) {
      setIsLocked(false);
      sessionStorage.setItem(`ss_${workspaceId}_unlocked`, 'true');
    }
    pushToCloud({ pin: cleanPin });
  };

  // ─── User / Partner actions ────────────────────────────────────────
  const updatePartners = (newPartners) => {
    setPartners(newPartners);
    const active = newPartners.find(p => p.id === currentUser?.id);
    if (active) setCurrentUser(active);
    pushToCloud({ partners: newPartners });
  };

  const updatePartner = (partnerId, updates) => {
    const updated = partners.map(p => p.id === partnerId ? { ...p, ...updates } : p);
    setPartners(updated);
    if (currentUser?.id === partnerId) {
      const active = updated.find(p => p.id === partnerId);
      if (active) setCurrentUser(active);
    }
    pushToCloud({ partners: updated });
  };

  const switchUser = (partnerId) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) setCurrentUser(partner);
  };

  // ─── Schedule ──────────────────────────────────────────────────────
  const updateSchedule = (newSchedule) => {
    const updatedSched = { ...dailySchedule, ...newSchedule };
    setDailySchedule(updatedSched);
    let updatedMeetings = meetings;
    if (newSchedule.defaultHour || newSchedule.meetUrl) {
      updatedMeetings = meetings.map(m => m.id === activeMeetingId ? {
        ...m,
        time: newSchedule.defaultHour || m.time,
        meetUrl: newSchedule.meetUrl || m.meetUrl
      } : m);
      setMeetings(updatedMeetings);
    }
    pushToCloud({ dailySchedule: updatedSched, meetings: updatedMeetings });
  };

  // ─── Meetings ──────────────────────────────────────────────────────
  const shiftMeetingTime = (meetingId, minutesDelta) => {
    const updatedMeetings = meetings.map(m => {
      if (m.id === meetingId) {
        let [h, min] = m.time.split(':').map(Number);
        if (isNaN(h)) h = 10;
        if (isNaN(min)) min = 0;
        const date = new Date();
        date.setHours(h, min + minutesDelta);
        const newH = String(date.getHours()).padStart(2, '0');
        const newM = String(date.getMinutes()).padStart(2, '0');
        return { ...m, time: `${newH}:${newM}` };
      }
      return m;
    });
    setMeetings(updatedMeetings);
    pushToCloud({ meetings: updatedMeetings });
  };

  const addMeeting = (newMeeting) => {
    const meeting = {
      id: `meet-${Date.now()}`,
      title: newMeeting.title || 'Nueva Reunión',
      date: newMeeting.date || TODAY,
      time: newMeeting.time || dailySchedule.defaultHour,
      duration: parseInt(newMeeting.duration) || dailySchedule.durationMinutes,
      status: 'Programada',
      notes: newMeeting.notes || '',
      meetUrl: newMeeting.meetUrl || dailySchedule.meetUrl
    };
    const updated = [meeting, ...meetings];
    setMeetings(updated);
    setActiveMeetingId(meeting.id);
    pushToCloud({ meetings: updated });
    return meeting;
  };

  // ─── Topics ────────────────────────────────────────────────────────
  const addTopic = (newTopic) => {
    const topic = {
      id: `topic-${Date.now()}`,
      meetingId: newTopic.meetingId || activeMeetingId,
      title: newTopic.title,
      description: newTopic.description || '',
      createdBy: currentUser.id,
      priority: newTopic.priority || 'Media',
      status: 'Pendiente',
      comments: []
    };
    const updated = [topic, ...topics];
    setTopics(updated);
    pushToCloud({ topics: updated });
  };

  const updateTopicStatus = (topicId, status) => {
    const updated = topics.map(t => t.id === topicId ? { ...t, status } : t);
    setTopics(updated);
    pushToCloud({ topics: updated });
  };

  const addTopicComment = (topicId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    const updated = topics.map(t => t.id === topicId ? { ...t, comments: [...(t.comments || []), comment] } : t);
    setTopics(updated);
    pushToCloud({ topics: updated });
  };

  // ─── Action Items ──────────────────────────────────────────────────
  const addActionItem = (newItem) => {
    const assignedPartner = partners.find(p => p.id === newItem.assignedTo);
    const item = {
      id: `action-${Date.now()}`,
      title: newItem.title,
      description: newItem.description || '',
      assignedTo: newItem.assignedTo || 'socio_1',
      assignedToName: newItem.assignedTo === 'ambos' ? 'Ambos' : assignedPartner?.name.split(' ')[0] || 'Socio',
      dueDate: newItem.dueDate || TODAY,
      priority: newItem.priority || 'Media',
      status: 'Pendiente',
      meetingId: newItem.meetingId || activeMeetingId,
      comments: []
    };
    const updated = [item, ...actionItems];
    setActionItems(updated);
    pushToCloud({ actionItems: updated });
  };

  const updateActionStatus = (actionId, status) => {
    const updated = actionItems.map(a => a.id === actionId ? { ...a, status } : a);
    setActionItems(updated);
    pushToCloud({ actionItems: updated });
  };

  const addActionComment = (actionId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    const updated = actionItems.map(a => a.id === actionId ? { ...a, comments: [...(a.comments || []), comment] } : a);
    setActionItems(updated);
    pushToCloud({ actionItems: updated });
  };

  // ─── Ideas ─────────────────────────────────────────────────────────
  const addIdea = (newIdea) => {
    const idea = {
      id: `idea-${Date.now()}`,
      title: newIdea.title,
      description: newIdea.description || '',
      category: newIdea.category || 'Nuevos Servicios',
      createdBy: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      votes: [currentUser.id],
      status: 'Idea',
      comments: []
    };
    const updated = [idea, ...ideas];
    setIdeas(updated);
    pushToCloud({ ideas: updated });
  };

  const toggleVoteIdea = (ideaId) => {
    const updated = ideas.map(i => {
      if (i.id === ideaId) {
        const hasVoted = (i.votes || []).includes(currentUser.id);
        const updatedVotes = hasVoted
          ? i.votes.filter(id => id !== currentUser.id)
          : [...(i.votes || []), currentUser.id];
        return { ...i, votes: updatedVotes };
      }
      return i;
    });
    setIdeas(updated);
    pushToCloud({ ideas: updated });
  };

  const addIdeaComment = (ideaId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    const updated = ideas.map(i => i.id === ideaId ? { ...i, comments: [...(i.comments || []), comment] } : i);
    setIdeas(updated);
    pushToCloud({ ideas: updated });
  };

  const convertIdeaToTopic = (ideaId, meetingId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    addTopic({
      meetingId: meetingId || activeMeetingId,
      title: `💡 [Idea] ${idea.title}`,
      description: idea.description,
      priority: 'Media'
    });
    const updatedIdeas = ideas.map(i => i.id === ideaId ? { ...i, status: 'Llevada a Reunión' } : i);
    setIdeas(updatedIdeas);
    pushToCloud({ ideas: updatedIdeas });
  };

  // ─── Clear data ────────────────────────────────────────────────────
  const clearAllData = () => {
    const initialMeetings = [{
      id: 'meet-initial',
      title: 'Reunión Diaria de Sincronización',
      date: TODAY,
      time: dailySchedule.defaultHour,
      duration: 45,
      status: 'Programada',
      notes: 'Agrega tus propios temas y compromisos.',
      meetUrl: dailySchedule.meetUrl
    }];
    setMeetings(initialMeetings);
    setTopics([]);
    setActionItems([]);
    setIdeas([]);
    setActiveMeetingId('meet-initial');
    saveWorkspaceToLocal(workspaceId, {
      meetings: initialMeetings, topics: [], actionItems: [], ideas: []
    });
    pushToCloud({ meetings: initialMeetings, topics: [], actionItems: [], ideas: [] });
  };

  const manualSyncNow = () => {
    lastCloudTs.current = 0;
    isMutating.current = false;
    pullFromCloudForWorkspace(activeWsRef.current);
  };

  return (
    <AppContext.Provider value={{
      workspaceId,
      switchWorkspace,
      savedWorkspaces,
      workspacePin,
      isLocked,
      unlockWorkspace,
      lockWorkspace,
      updateWorkspacePin,
      partners,
      updatePartner,
      updatePartners,
      currentUser,
      switchUser,
      dailySchedule,
      updateSchedule,
      meetings,
      activeMeetingId,
      setActiveMeetingId,
      shiftMeetingTime,
      addMeeting,
      topics,
      addTopic,
      updateTopicStatus,
      addTopicComment,
      actionItems,
      addActionItem,
      updateActionStatus,
      addActionComment,
      ideas,
      addIdea,
      toggleVoteIdea,
      addIdeaComment,
      convertIdeaToTopic,
      clearAllData,
      syncStatus,
      lastSyncTime,
      manualSyncNow
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
