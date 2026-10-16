import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";

export type CallMediaType = "audio" | "video";

const ICE_SERVERS = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

type IncomingOffer = {
  chatId: number;
  sdp: ConstructorParameters<typeof RTCSessionDescription>[0];
  mediaType: CallMediaType;
};

const getCallMediaConstraints = (mediaType: CallMediaType) => {
  if (mediaType === "audio") {
    return {
      audio: true,
      video: false,
    };
  }

  return {
    audio: true,
    video: { facingMode: "user", width: 640, height: 480, frameRate: 30 },
  };
};

export function useVideoCall(
  ws: RefObject<WebSocket | null>,
  isConnected: boolean,
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingOffer, setIncomingOffer] = useState<IncomingOffer | null>(
    null,
  );
  const [callMediaType, setCallMediaType] = useState<CallMediaType>("video");
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeChatIdRef = useRef<number | null>(null);
  const activeCallMediaTypeRef = useRef<CallMediaType>("video");
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const attachedMediaPeerRef = useRef<RTCPeerConnection | null>(null);

  const clearLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
  }, []);

  const clearRemoteStream = useCallback(() => {
    setRemoteStream(null);
  }, []);

  const closePeerConnection = useCallback(() => {
    if (pc.current) {
      pc.current.ontrack = null;
      pc.current.onicecandidate = null;
      pc.current.close();
      pc.current = null;
    }

    attachedMediaPeerRef.current = null;
    pendingCandidatesRef.current = [];
    activeChatIdRef.current = null;
    activeCallMediaTypeRef.current = "video";
    setCallMediaType("video");
  }, []);

  const resetCallState = useCallback(() => {
    clearLocalStream();
    clearRemoteStream();
    closePeerConnection();
    setIncomingOffer(null);
  }, [clearLocalStream, clearRemoteStream, closePeerConnection]);

  const send = useCallback(
    (payload: object) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(payload));
      }
    },
    [ws],
  );

  const ensurePeerConnection = useCallback(() => {
    if (pc.current) {
      return pc.current;
    }

    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.ontrack = (event: any) => {
      const remote = event?.streams?.[0];
      if (remote) {
        setRemoteStream(remote);
      }
    };

    peer.onicecandidate = (event: any) => {
      if (event.candidate && activeChatIdRef.current != null) {
        send({
          type: "call",
          chat_id: activeChatIdRef.current,
          payload_type: "candidate",
          candidate: event.candidate,
        });
      }
    };

    pc.current = peer;
    return peer;
  }, [send]);

  const attachLocalMedia = useCallback(
    async (
      peer: RTCPeerConnection,
      mediaType: CallMediaType = activeCallMediaTypeRef.current,
    ) => {
      let stream = localStreamRef.current;

      if (!stream || mediaType !== activeCallMediaTypeRef.current) {
        stream = await mediaDevices.getUserMedia(
          getCallMediaConstraints(mediaType),
        );
        localStreamRef.current = stream;
        setLocalStream(stream);
      }

      if (attachedMediaPeerRef.current !== peer) {
        stream.getTracks().forEach((track) => peer.addTrack(track, stream));
        attachedMediaPeerRef.current = peer;
      }

      activeCallMediaTypeRef.current = mediaType;
      setCallMediaType(mediaType);

      return stream;
    },
    [],
  );

  const flushPendingCandidates = useCallback(
    async (peer: RTCPeerConnection) => {
      const pending = pendingCandidatesRef.current;

      if (pending.length === 0) {
        return;
      }

      try {
        for (const candidate of pending) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        }

        pendingCandidatesRef.current = [];
      } catch (error) {
        console.error("Failed to flush pending ICE candidates:", error);
      }
    },
    [],
  );

  useEffect(() => {
    if (!isConnected || !ws.current) {
      return;
    }

    const socket = ws.current;

    const handleMessage = async ({ data }: MessageEvent<string>) => {
      const msg = JSON.parse(data);

      if (msg.type !== "call") {
        return;
      }

      const peer = ensurePeerConnection();

      if (msg.payload_type === "offer") {
        const mediaType =
          (msg.media_type as CallMediaType | undefined) ?? "video";

        activeChatIdRef.current = msg.chat_id;
        activeCallMediaTypeRef.current = mediaType;
        setCallMediaType(mediaType);
        pendingCandidatesRef.current = [];
        setIncomingOffer({
          chatId: msg.chat_id,
          sdp: msg.sdp,
          mediaType,
        });
        return;
      }

      if (msg.payload_type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        await flushPendingCandidates(peer);
        return;
      }

      if (msg.payload_type === "candidate") {
        const candidate = msg.candidate as RTCIceCandidateInit;
        if (peer.remoteDescription) {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
        return;
      }

      if (msg.payload_type === "hangup") {
        console.log("Received call hangup:", msg);
        resetCallState();
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [
    isConnected,
    ws,
    ensurePeerConnection,
    flushPendingCandidates,
    resetCallState,
  ]);

  const startCall = useCallback(
    async (roomId: number, mediaType: CallMediaType = "video") => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot start call.");
        return;
      }

      const peer = ensurePeerConnection();
      activeChatIdRef.current = roomId;
      activeCallMediaTypeRef.current = mediaType;
      setCallMediaType(mediaType);

      await attachLocalMedia(peer, mediaType);

      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: mediaType === "video",
      });
      await peer.setLocalDescription(offer);

      send({
        type: "call",
        chat_id: roomId,
        media_type: mediaType,
        payload_type: "offer",
        sdp: offer,
      });
    },
    [attachLocalMedia, ensurePeerConnection, send, ws],
  );

  const joinCall = useCallback(
    async (roomId?: number, mediaType?: CallMediaType) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        console.error("WebSocket is not open. Cannot join call.");
        return;
      }

      const offer = incomingOffer;
      if (!offer) {
        console.error("No incoming offer available to join.");
        return;
      }

      if (roomId != null && roomId !== offer.chatId) {
        console.error("Incoming offer does not match the requested room.");
        return;
      }

      const resolvedMediaType = mediaType ?? offer.mediaType;
      const peer = ensurePeerConnection();
      activeChatIdRef.current = offer.chatId;
      activeCallMediaTypeRef.current = resolvedMediaType;
      setCallMediaType(resolvedMediaType);

      await attachLocalMedia(peer, resolvedMediaType);
      await peer.setRemoteDescription(new RTCSessionDescription(offer.sdp));
      await flushPendingCandidates(peer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      send({
        type: "call",
        chat_id: offer.chatId,
        payload_type: "answer",
        sdp: answer,
      });

      setIncomingOffer(null);
    },
    [
      attachLocalMedia,
      ensurePeerConnection,
      flushPendingCandidates,
      incomingOffer,
      send,
      ws,
    ],
  );

  const rejectCall = useCallback(() => {
    const offer = incomingOffer;
    if (offer) {
      send({
        type: "call",
        chat_id: offer.chatId,
        payload_type: "hangup",
      });
    }

    resetCallState();
  }, [incomingOffer, resetCallState, send]);

  const endCall = useCallback(() => {
    const chatId = activeChatIdRef.current ?? incomingOffer?.chatId;

    if (chatId != null) {
      send({
        type: "call",
        chat_id: chatId,
        payload_type: "hangup",
      });
    }

    resetCallState();
  }, [incomingOffer, resetCallState, send]);

  const toggleMute = () =>
    localStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
  const toggleCamera = () => {
    if (callMediaType === "audio") {
      return;
    }

    localStream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
  };
  const flipCamera = () => {
    if (callMediaType === "audio") {
      return;
    }

    localStream?.getVideoTracks().forEach((t) => (t as any)._switchCamera());
  };

  return {
    localStream,
    remoteStream,
    incomingOffer,
    callMediaType,
    isAudioOnly: callMediaType === "audio",
    hasIncomingOffer: incomingOffer !== null,
    startCall,
    joinCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
    flipCamera,
  };
}
