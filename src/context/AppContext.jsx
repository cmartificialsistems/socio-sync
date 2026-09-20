import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

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

export const AppProvider = ({ children }) => {
  const [partners, setPartners] = useState(() => {
    const saved = localStorage.getItem('socio_sync_partners_v2');
    return saved ? JSON.parse(saved) : DEFAULT_PARTNERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('socio_sync_user_v2');
    return saved ? JSON.parse(saved) : partners[0];
  });

  const [dailySchedule, setDailySchedule] = useState(() => {
    const saved = localStorage.getItem('socio_sync_schedule_v2');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_SCHEDULE;
  });

  const [meetings, setMeetings] = useState(() => {
    const saved = localStorage.getItem('socio_sync_meetings_v2');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'meet-initial',
      title: 'Reunión Diaria de Sincronización',
      date: TODAY,
      time: '10:00',
      duration: 45,
      status: 'Programada',
      notes: 'Bienvenido a SocioSync. Agrega aquí los puntos a tratar para la sesión de hoy.',
      meetUrl: DEFAULT_DAILY_SCHEDULE.meetUrl
    }];
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('socio_sync_topics_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [actionItems, setActionItems] = useState(() => {
    const saved = localStorage.getItem('socio_sync_actions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [ideas, setIdeas] = useState(() => {
    const saved = localStorage.getItem('socio_sync_ideas_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeMeetingId, setActiveMeetingId] = useState(() => {
    return meetings[0]?.id || 'meet-initial';
  });

  const [syncStatus, setSyncStatus] = useState('connected'); // connected, syncing, offline
  const isLocalUpdate = useRef(false);

  // Cloud Sync Room Key
  const [roomKey, setRoomKey] = useState(() => {
    return localStorage.getItem('socio_sync_room_key') || 'sociosync_colombia_room';
  });

  // Supabase Custom Config
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('socio_sync_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('socio_sync_supabase_key') || '');

  // Save room & supabase config
  useEffect(() => {
    localStorage.setItem('socio_sync_room_key', roomKey);
  }, [roomKey]);

  useEffect(() => {
    localStorage.setItem('socio_sync_supabase_url', supabaseUrl);
    localStorage.setItem('socio_sync_supabase_key', supabaseKey);
  }, [supabaseUrl, supabaseKey]);

  // Local Storage Persistence
  useEffect(() => {
    localStorage.setItem('socio_sync_partners_v2', JSON.stringify(partners));
  }, [partners]);

  useEffect(() => {
    localStorage.setItem('socio_sync_user_v2', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('socio_sync_schedule_v2', JSON.stringify(dailySchedule));
  }, [dailySchedule]);

  useEffect(() => {
    localStorage.setItem('socio_sync_meetings_v2', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('socio_sync_topics_v2', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('socio_sync_actions_v2', JSON.stringify(actionItems));
  }, [actionItems]);

  useEffect(() => {
    localStorage.setItem('socio_sync_ideas_v2', JSON.stringify(ideas));
  }, [ideas]);

  // REAL-TIME CLOUD SYNC LOGIC
  const syncToCloud = useCallback(async (stateToPush) => {
    try {
      setSyncStatus('syncing');
      const binId = localStorage.getItem('socio_sync_bin_id') || 'c44c5b367d30f353ad63';
      const payload = {
        updatedAt: Date.now(),
        partners: stateToPush?.partners || partners,
        dailySchedule: stateToPush?.dailySchedule || dailySchedule,
        meetings: stateToPush?.meetings || meetings,
        topics: stateToPush?.topics || topics,
        actionItems: stateToPush?.actionItems || actionItems,
        ideas: stateToPush?.ideas || ideas
      };
      
      await fetch(`https://api.npoint.io/${binId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setSyncStatus('connected');
    } catch (e) {
      console.warn('Cloud sync push error:', e);
      setSyncStatus('offline');
    }
  }, [partners, dailySchedule, meetings, topics, actionItems, ideas]);

  // Auto-sync trigger on data change
  const triggerSync = (newState) => {
    isLocalUpdate.current = true;
    syncToCloud(newState);
  };

  // Poll cloud state every 3 seconds for partner updates
  useEffect(() => {
    const binId = localStorage.getItem('socio_sync_bin_id') || 'c44c5b367d30f353ad63';
    
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.npoint.io/${binId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && data.updatedAt) {
          const lastLocalUpdate = parseInt(localStorage.getItem('socio_sync_last_cloud_ts') || '0', 10);
          if (data.updatedAt > lastLocalUpdate && !isLocalUpdate.current) {
            localStorage.setItem('socio_sync_last_cloud_ts', String(data.updatedAt));
            
            if (data.partners) setPartners(data.partners);
            if (data.dailySchedule) setDailySchedule(data.dailySchedule);
            if (data.meetings) setMeetings(data.meetings);
            if (data.topics) setTopics(data.topics);
            if (data.actionItems) setActionItems(data.actionItems);
            if (data.ideas) setIdeas(data.ideas);

            setSyncStatus('connected');
          }
        }
      } catch (e) {
        setSyncStatus('offline');
      } finally {
        isLocalUpdate.current = false;
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  const updatePartner = (partnerId, updates) => {
    const updated = partners.map(p => p.id === partnerId ? { ...p, ...updates } : p);
    setPartners(updated);
    if (currentUser.id === partnerId) {
      setCurrentUser(updated.find(p => p.id === partnerId));
    }
    triggerSync({ partners: updated });
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
    triggerSync({ dailySchedule: updatedSched, meetings: updatedMeetings });
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
    triggerSync({ meetings: updatedMeetings });
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
    triggerSync({ meetings: updated });
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
    triggerSync({ topics: updated });
  };

  const updateTopicStatus = (topicId, status) => {
    const updated = topics.map(t => t.id === topicId ? { ...t, status } : t);
    setTopics(updated);
    triggerSync({ topics: updated });
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
    triggerSync({ topics: updated });
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
    triggerSync({ actionItems: updated });
  };

  const updateActionStatus = (actionId, status) => {
    const updated = actionItems.map(a => a.id === actionId ? { ...a, status } : a);
    setActionItems(updated);
    triggerSync({ actionItems: updated });
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
    triggerSync({ actionItems: updated });
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
    triggerSync({ ideas: updated });
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
    triggerSync({ ideas: updated });
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
    triggerSync({ ideas: updated });
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
    triggerSync({ ideas: updatedIdeas });
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
    triggerSync({ meetings: initialMeetings, topics: [], actionItems: [], ideas: [] });
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
      roomKey,
      setRoomKey,
      supabaseUrl,
      setSupabaseUrl,
      supabaseKey,
      setSupabaseKey
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
