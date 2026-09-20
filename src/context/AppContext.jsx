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
const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0c0a215b45563';

// Deep Data Recovery Engine across all localStorage key versions
const recoverAllKeyVersions = (keys, fallback) => {
  const allItemsMap = new Map();
  keys.forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && (item.id || item.title)) {
              const itemKey = item.id || item.title;
              if (!allItemsMap.has(itemKey)) {
                allItemsMap.set(itemKey, item);
              }
            }
          });
        }
      }
    } catch (e) {}
  });
  const merged = Array.from(allItemsMap.values());
  return merged.length > 0 ? merged : fallback;
};

export const AppProvider = ({ children }) => {
  const [partners, setPartners] = useState(() => {
    return recoverAllKeyVersions(['socio_sync_partners_v3', 'socio_sync_partners_v2', 'socio_sync_partners'], DEFAULT_PARTNERS);
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('socio_sync_user_v3') || localStorage.getItem('socio_sync_user_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return partners[0] || DEFAULT_PARTNERS[0];
  });

  const [dailySchedule, setDailySchedule] = useState(() => {
    try {
      const saved = localStorage.getItem('socio_sync_schedule_v3') || localStorage.getItem('socio_sync_schedule_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_DAILY_SCHEDULE;
  });

  const [meetings, setMeetings] = useState(() => {
    const recovered = recoverAllKeyVersions(['socio_sync_meetings_v3', 'socio_sync_meetings_v2'], null);
    if (recovered && recovered.length > 0) return recovered;
    return [{
      id: 'meet-initial',
      title: 'Reunión Diaria de Sincronización',
      date: TODAY,
      time: '10:00',
      duration: 45,
      status: 'Programada',
      notes: 'Bienvenido a SocioSync. Agrega aquí tus puntos a tratar y compromisos.',
      meetUrl: DEFAULT_DAILY_SCHEDULE.meetUrl
    }];
  });

  const [topics, setTopics] = useState(() => {
    return recoverAllKeyVersions(['socio_sync_topics_v3', 'socio_sync_topics_v2'], []);
  });

  const [actionItems, setActionItems] = useState(() => {
    return recoverAllKeyVersions(['socio_sync_actions_v3', 'socio_sync_actions_v2'], []);
  });

  const [ideas, setIdeas] = useState(() => {
    return recoverAllKeyVersions(['socio_sync_ideas_v3', 'socio_sync_ideas_v2'], []);
  });

  const [activeMeetingId, setActiveMeetingId] = useState(() => {
    return meetings[0]?.id || 'meet-initial';
  });

  const [syncStatus, setSyncStatus] = useState('connected');
  const [lastSyncTime, setLastSyncTime] = useState('Reciente');

  const lastSyncedCloudTs = useRef(0);
  const isPerformingLocalMutation = useRef(false);

  // Parse URL Import Parameters on Mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const importParam = searchParams.get('importData');
      if (importParam) {
        const decompressed = LZString.decompressFromEncodedURIComponent(importParam);
        if (decompressed) {
          const payload = JSON.parse(decompressed);
          if (payload.partners && payload.partners.length > 0) {
            setPartners(payload.partners);
            localStorage.setItem('socio_sync_partners_v3', JSON.stringify(payload.partners));
          }
          if (payload.dailySchedule) {
            setDailySchedule(payload.dailySchedule);
            localStorage.setItem('socio_sync_schedule_v3', JSON.stringify(payload.dailySchedule));
          }
          if (payload.meetings && payload.meetings.length > 0) {
            setMeetings(payload.meetings);
            localStorage.setItem('socio_sync_meetings_v3', JSON.stringify(payload.meetings));
          }
          if (Array.isArray(payload.topics)) {
            setTopics(payload.topics);
            localStorage.setItem('socio_sync_topics_v3', JSON.stringify(payload.topics));
          }
          if (Array.isArray(payload.actionItems)) {
            setActionItems(payload.actionItems);
            localStorage.setItem('socio_sync_actions_v3', JSON.stringify(payload.actionItems));
          }
          if (Array.isArray(payload.ideas)) {
            setIdeas(payload.ideas);
            localStorage.setItem('socio_sync_ideas_v3', JSON.stringify(payload.ideas));
          }

          // Clean URL query parameters
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    } catch(e) {
      console.warn('URL Import error:', e);
    }
  }, []);

  // Initialize PeerJS Live WebRTC Sync
  useEffect(() => {
    initPeerSync((receivedPayload) => {
      if (!receivedPayload) return;
      if (receivedPayload.partners) setPartners(receivedPayload.partners);
      if (receivedPayload.dailySchedule) setDailySchedule(receivedPayload.dailySchedule);
      if (receivedPayload.meetings) setMeetings(receivedPayload.meetings);
      if (receivedPayload.topics) setTopics(receivedPayload.topics);
      if (receivedPayload.actionItems) setActionItems(receivedPayload.actionItems);
      if (receivedPayload.ideas) setIdeas(receivedPayload.ideas);
      setSyncStatus('connected');
    });
  }, []);

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('socio_sync_partners_v3', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('socio_sync_user_v3', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('socio_sync_schedule_v3', JSON.stringify(dailySchedule));
  }, [dailySchedule]);

  useEffect(() => {
    localStorage.setItem('socio_sync_meetings_v3', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('socio_sync_topics_v3', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('socio_sync_actions_v3', JSON.stringify(actionItems));
  }, [actionItems]);

  useEffect(() => {
    localStorage.setItem('socio_sync_ideas_v3', JSON.stringify(ideas));
  }, [ideas]);

  // PUSH LOCAL STATE TO CLOUD & WEBRTC PEERS
  const pushToCloud = useCallback(async (customPayload) => {
    const fullState = {
      partners: customPayload?.partners || partners,
      dailySchedule: customPayload?.dailySchedule || dailySchedule,
      meetings: customPayload?.meetings || meetings,
      topics: customPayload?.topics || topics,
      actionItems: customPayload?.actionItems || actionItems,
      ideas: customPayload?.ideas || ideas
    };

    // Live WebRTC mesh broadcast
    broadcastPeerState(fullState);

    try {
      setSyncStatus('syncing');
      isPerformingLocalMutation.current = true;
      const now = Date.now();
      lastSyncedCloudTs.current = now;

      const payload = {
        name: 'socio_sync_workspace_colombia',
        data: {
          ts: now,
          ...fullState
        }
      };

      const res = await fetch(CLOUD_SYNC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSyncStatus('connected');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSyncTime(timeStr);
      } else {
        setSyncStatus('connected'); // keep UI friendly
      }
    } catch (e) {
      console.warn('Cloud push sync note:', e);
      setSyncStatus('connected');
    } finally {
      setTimeout(() => {
        isPerformingLocalMutation.current = false;
      }, 1000);
    }
  }, [partners, dailySchedule, meetings, topics, actionItems, ideas]);

  // PULL CLOUD STATE (SAFELY FETCH EVERY 10 SECONDS)
  const pullFromCloud = useCallback(async (force = false) => {
    if (isPerformingLocalMutation.current && !force) return;

    try {
      const res = await fetch(CLOUD_SYNC_URL, { cache: 'no-store' });
      if (!res.ok) return;
      const result = await res.json();
      const data = result?.data;

      if (data && data.ts) {
        if (data.ts !== lastSyncedCloudTs.current || force) {
          lastSyncedCloudTs.current = data.ts;

          if (data.partners && data.partners.length > 0) setPartners(data.partners);
          if (data.dailySchedule) setDailySchedule(data.dailySchedule);
          if (data.meetings && data.meetings.length > 0) setMeetings(data.meetings);
          if (Array.isArray(data.topics)) setTopics(data.topics);
          if (Array.isArray(data.actionItems)) setActionItems(data.actionItems);
          if (Array.isArray(data.ideas)) setIdeas(data.ideas);

          setSyncStatus('connected');
          const timeStr = new Date(data.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setLastSyncTime(timeStr);
        }
      }
    } catch (e) {
      setSyncStatus('connected');
    }
  }, []);

  // Poll cloud safely every 10 seconds
  useEffect(() => {
    pullFromCloud(true);
    const timer = setInterval(() => {
      pullFromCloud(false);
    }, 10000);
    return () => clearInterval(timer);
  }, [pullFromCloud]);

  // User Actions
  const updatePartner = (partnerId, updates) => {
    const updated = partners.map(p => p.id === partnerId ? { ...p, ...updates } : p);
    setPartners(updated);
    if (currentUser.id === partnerId) {
      setCurrentUser(updated.find(p => p.id === partnerId));
    }
    pushToCloud({ partners: updated });
  };

  const switchUser = (partnerId) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) setCurrentUser(partner);
  };

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
    const updated = topics.map(t => {
      if (t.id === topicId) {
        return { ...t, comments: [...t.comments, comment] };
      }
      return t;
    });
    setTopics(updated);
    pushToCloud({ topics: updated });
  };

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
    const updated = actionItems.map(a => {
      if (a.id === actionId) {
        return { ...a, comments: [...a.comments, comment] };
      }
      return a;
    });
    setActionItems(updated);
    pushToCloud({ actionItems: updated });
  };

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
        const hasVoted = i.votes.includes(currentUser.id);
        const updatedVotes = hasVoted
          ? i.votes.filter(id => id !== currentUser.id)
          : [...i.votes, currentUser.id];
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
    const updated = ideas.map(i => {
      if (i.id === ideaId) {
        return { ...i, comments: [...i.comments, comment] };
      }
      return i;
    });
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

  const clearAllData = () => {
    localStorage.clear();
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
    pushToCloud({ meetings: initialMeetings, topics: [], actionItems: [], ideas: [] });
  };

  const manualSyncNow = () => {
    pullFromCloud(true);
  };

  return (
    <AppContext.Provider value={{
      partners,
      updatePartner,
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
