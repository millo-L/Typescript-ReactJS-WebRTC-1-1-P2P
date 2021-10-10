import React, { useEffect, useRef } from "react";
import io from "socket.io-client";

const App = () => {
  const socket = io.connect("http://localhost:8080");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pc_config = {
    iceServers: [
      // {
      //   urls: 'stun:[STUN_IP]:[PORT]',
      //   'credentials': '[YOR CREDENTIALS]',
      //   'username': '[USERNAME]'
      // },
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  useEffect(() => {
    const newPC = new RTCPeerConnection(pc_config);

    socket.on("all_users", (allUsers: Array<{ id: string; email: string }>) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });

    socket.on("getOffer", (sdp: RTCSessionDescription) => {
      //console.log(sdp);
      console.log("get offer");
      createAnswer(sdp);
    });

    socket.on("getAnswer", (sdp: RTCSessionDescription) => {
      console.log("get answer");
      newPC.setRemoteDescription(new RTCSessionDescription(sdp));
      //console.log(sdp);
    });

    socket.on("getCandidate", (candidate: RTCIceCandidateInit) => {
      newPC.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
        console.log("candidate add success");
      });
    });

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        stream.getTracks().forEach((track) => {
          newPC.addTrack(track, stream);
        });
        newPC.onicecandidate = (e) => {
          if (e.candidate) {
            console.log("onicecandidate");
            socket.emit("candidate", e.candidate);
          }
        };
        newPC.oniceconnectionstatechange = (e) => {
          console.log(e);
        };

        newPC.ontrack = (ev) => {
          console.log("add remotetrack success");
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = ev.streams[0];
          }
        };

        socket.emit("join_room", { room: "1234", email: "sample@naver.com" });
      })
      .catch((error) => {
        console.log(`getUserMedia error: ${error}`);
      });

    const createOffer = async () => {
      console.log("create offer");
      try {
        const sdp = await newPC.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await newPC.setLocalDescription(new RTCSessionDescription(sdp));
        socket.emit("offer", sdp);
      } catch (e) {
        console.error(e);
      }
    };

    const createAnswer = async (sdp: RTCSessionDescription) => {
      try {
        await newPC.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("answer set remote description success");
        const mySdp = await newPC.createAnswer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true,
        });
        console.log("create answer");
        await newPC.setLocalDescription(new RTCSessionDescription(mySdp));
        socket.emit("answer", mySdp);
      } catch (e) {
        console.error(e);
      }
    };
  }, []);

  return (
    <div>
      <video
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        muted
        ref={localVideoRef}
        autoPlay
      />
      <video
        id="remotevideo"
        style={{
          width: 240,
          height: 240,
          margin: 5,
          backgroundColor: "black",
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </div>
  );
};

export default App;
