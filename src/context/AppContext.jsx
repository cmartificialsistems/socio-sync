import React, { createContext, useContext, useState, useEffect } from 'react';

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
      notes: 'Bienvenido a SocioSync. Agrega aquí los puntos a tratar para la sesión de hoy.'
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

  // Persistence Effects
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

  const updatePartner = (partnerId, updates) => {
    setPartners(prev => {
      const updated = prev.map(p => p.id === partnerId ? { ...p, ...updates } : p);
      if (currentUser.id === partnerId) {
        setCurrentUser(updated.find(p => p.id === partnerId));
      }
      return updated;
    });
  };

  const switchUser = (partnerId) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) setCurrentUser(partner);
  };

  const updateSchedule = (newSchedule) => {
    setDailySchedule(prev => ({ ...prev, ...newSchedule }));
    if (newSchedule.defaultHour) {
      setMeetings(prev => prev.map(m => m.id === activeMeetingId ? { ...m, time: newSchedule.defaultHour } : m));
    }
  };

  const shiftMeetingTime = (meetingId, minutesDelta) => {
    setMeetings(prev => prev.map(m => {
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
    }));
  };

  const addMeeting = (newMeeting) => {
    const meeting = {
      id: `meet-${Date.now()}`,
      title: newMeeting.title || 'Nueva Reunión',
      date: newMeeting.date || TODAY,
      time: newMeeting.time || dailySchedule.defaultHour,
      duration: parseInt(newMeeting.duration) || dailySchedule.durationMinutes,
      status: 'Programada',
      notes: newMeeting.notes || ''
    };
    setMeetings(prev => [meeting, ...prev]);
    setActiveMeetingId(meeting.id);
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
    setTopics(prev => [topic, ...prev]);
  };

  const updateTopicStatus = (topicId, status) => {
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status } : t));
  };

  const addTopicComment = (topicId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return { ...t, comments: [...t.comments, comment] };
      }
      return t;
    }));
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
    setActionItems(prev => [item, ...prev]);
  };

  const updateActionStatus = (actionId, status) => {
    setActionItems(prev => prev.map(a => a.id === actionId ? { ...a, status } : a));
  };

  const addActionComment = (actionId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    setActionItems(prev => prev.map(a => {
      if (a.id === actionId) {
        return { ...a, comments: [...a.comments, comment] };
      }
      return a;
    }));
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
    setIdeas(prev => [idea, ...prev]);
  };

  const toggleVoteIdea = (ideaId) => {
    setIdeas(prev => prev.map(i => {
      if (i.id === ideaId) {
        const hasVoted = i.votes.includes(currentUser.id);
        const updatedVotes = hasVoted
          ? i.votes.filter(id => id !== currentUser.id)
          : [...i.votes, currentUser.id];
        return { ...i, votes: updatedVotes };
      }
      return i;
    }));
  };

  const addIdeaComment = (ideaId, commentText) => {
    const comment = {
      id: `comm-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name.split(' ')[0],
      text: commentText,
      timestamp: 'Justo ahora'
    };
    setIdeas(prev => prev.map(i => {
      if (i.id === ideaId) {
        return { ...i, comments: [...i.comments, comment] };
      }
      return i;
    }));
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

    setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, status: 'Llevada a Reunión' } : i));
  };

  const clearAllData = () => {
    localStorage.clear();
    setMeetings([{
      id: 'meet-initial',
      title: 'Reunión Diaria de Sincronización',
      date: TODAY,
      time: dailySchedule.defaultHour,
      duration: 45,
      status: 'Programada',
      notes: 'Agrega tus propios temas y compromisos.'
    }]);
    setTopics([]);
    setActionItems([]);
    setIdeas([]);
    setActiveMeetingId('meet-initial');
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
      clearAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
