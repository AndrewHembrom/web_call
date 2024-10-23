// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const App: React.FC = () => {
//   const localVideoRef = useRef<HTMLVideoElement>(null); // Reference to the local video element
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null); // Store the local media stream
//   const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

//   useEffect(() => {
//     // Get the user's video and audio stream
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((mediaStream) => {
//         setLocalStream(mediaStream); // Store the stream in state
//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = mediaStream;
//         }
//       })
//       .catch((error) => {
//         console.error("Error accessing media devices:", error);
//       });

//   }, []); // Empty dependency array ensures this runs once on mount

//   // // Effect to assign the media stream to the local video element
//   // useEffect(() => {
//   //   if (localVideoRef.current && localStream) {
//   //     localVideoRef.current.srcObject = localStream;
//   //   }
//   // }, [localStream]); // Only run when stream changes

//   useEffect(() => {
//     if (localStream) {
//       const pc = new RTCPeerConnection({
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" }, // Google's public STUN server
//         ]
//       });

//       // Add local stream tracks to the peer connection
//       localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

//       // When a remote track is received, play it in the remote video element
//       pc.ontrack = (event) => {
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = event.streams[0];
//         }
//       }

//       // Handle the ICE candidates and send them to the other peer via Socket.io
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit('ice-candidate', event.candidate);
//         }
//       }

//       setPeerConnection(pc);
//     }
//   }, [localStream]);

//   //Handle offer/answer signaling
//   useEffect(() => {
//     socket.on('offer', async (offer) => {
//       if (peerConnection) {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//       }
//     })
//   })

//   return (
//     <div>
//       <h1>P2P Video Call</h1>
//       <div>
//         <video ref={localVideoRef} autoPlay playsInline muted></video>
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    // Get the user's video and audio stream
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setLocalStream(mediaStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });
  }, []);

  useEffect(() => {
    if (localStream) {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" }, // Google's public STUN server
        ],
      });

      // Add local stream tracks to the peer connection
      localStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, localStream));

      // When a remote track is received, play it in the remote video element
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle ICE candidates and send them to the other peer via Socket.io
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      setPeerConnection(pc);
    }
  }, [localStream]);

  // Handle offer/answer signaling
  useEffect(() => {
    socket.on("offer", async (offer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", answer);
      }
    });

    socket.on("answer", async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding received ICE candidate", error);
        }
      }
    });
  }, [peerConnection]);

  const createOffer = async () => {
    if (peerConnection) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
    }
  };

  return (
    <div>
      <h1>P2P Video Call</h1>
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted></video>
        <video ref={remoteVideoRef} autoPlay playsInline></video>
      </div>
      <button onClick={createOffer}>Start Call</button>
    </div>
  );
};

export default App;
