import Peer from 'peerjs';

let peer = null;
let activeConns = [];

export const initPeerSync = (onStateReceived) => {
  try {
    // Generate a consistent peer id or mesh room
    const roomId = 'sociosync_colombia_workspace_room';
    
    // Connect as a peer
    peer = new Peer({
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      console.log('PeerJS connected with ID:', id);
      
      // Connect to the common room host peer if we are secondary, or accept connections
      const conn = peer.connect(roomId);
      
      conn.on('open', () => {
        console.log('Connected to mesh room!');
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
