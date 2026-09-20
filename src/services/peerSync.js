import Peer from 'peerjs';

let peer = null;
let activeConns = [];

export const initPeerSync = (workspaceId = 'colombia', onStateReceived) => {
  try {
    const roomId = `sociosync_${workspaceId}_workspace_room`;
    
    // Close existing connection if switching
    if (peer) {
      try { peer.destroy(); } catch(e) {}
    }
    activeConns = [];

    peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      const conn = peer.connect(roomId);
      
      conn.on('open', () => {
        activeConns.push(conn);
      });

      conn.on('data', (data) => {
        if (data && data.type === 'SOCIO_SYNC_UPDATE' && onStateReceived) {
          onStateReceived(data.payload);
        }
      });
    });

    peer.on('connection', (conn) => {
      activeConns.push(conn);
      conn.on('data', (data) => {
        if (data && data.type === 'SOCIO_SYNC_UPDATE' && onStateReceived) {
          onStateReceived(data.payload);
        }
      });
    });

    peer.on('error', (err) => {
      console.warn('PeerJS warning:', err);
    });

  } catch (e) {
    console.warn('PeerJS init failed:', e);
  }
};

export const broadcastPeerState = (statePayload) => {
  activeConns.forEach(conn => {
    if (conn.open) {
      try {
        conn.send({
          type: 'SOCIO_SYNC_UPDATE',
          payload: statePayload,
          ts: Date.now()
        });
      } catch (e) {}
    }
  });
};
