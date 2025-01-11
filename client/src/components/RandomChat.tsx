import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { userAtom } from "../store";
import { socket } from "../config/socket";
import ChatBubbleInfo from "../components/ChatBubbleInfo";
import ChatBubble from "../components/ChatBubble";
import ChatContainer, { ChatStatus } from "../components/ChatContainer";
import SystemChatBubble from "../components/SystemChatBubble";
import IUser from "../types/IUser";

type MessageType = { sender: "me" | "stranger"; content: string };

interface RandomChatProps {
  withVideo?: boolean;
}

const RandomChat = ({ withVideo }: RandomChatProps) => {
  const navigate = useNavigate();

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const strangerVideoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const peerInstance = useRef<Peer | null>(null);
  const [user] = useAtom(userAtom);
  const [strangerPeerId, setStrangerPeerId] = useState<string | null>(null);

  const [userMediaStream, setUserMediaStream] = useState<MediaStream | null>(
    null
  );
  const [isStrangerHasStream, setIsStrangerHasStream] = useState(false);

  const [stranger, setStranger] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatStatus, setChatStatus] = useState(ChatStatus.CONNECTING);

  useEffect(() => {
    if (user.name === "") {
      navigate("/");
    }

    socket.connect();

    if (withVideo) {
      socket.emit("find-video-pair");
    } else {
      socket.emit("find-pair");
    }

    socket.on("pair-found", () => {
      setChatStatus(ChatStatus.CONNECTED);

      socket.emit("exchange-info", user);

      if (withVideo) {
        const peer = new Peer();

        peer.on("open", (id) => {
          socket.emit("send-peer-id", id);
        });

        socket.on("receive-peer-id", (peerId: string) => {
          setStrangerPeerId(peerId);
        });

        peerInstance.current = peer;
      }
    });

    socket.on("receive-info", (info: IUser) => {
      setStranger(info);
    });

    socket.on("receive-message", (message: MessageType) => {
      message.sender = "stranger";

      setMessages((prev) => [...prev, message]);
    });

    socket.on("pair-disconnected", () => {
      setChatStatus(ChatStatus.DISCONNECTED);
      setIsStrangerHasStream(false);
      peerInstance.current?.destroy();
    });

    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("pair-found");
      socket.off("receive-peer-id");
      socket.off("receive-info");
      socket.off("receive-message");
      socket.off("pair-disconnected");
    };
  }, [navigate, user, withVideo]);

  useEffect(() => {
    if (withVideo) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          setUserMediaStream((prev) => {
            if (prev) {
              prev.getTracks().forEach((track) => {
                track.stop();
              });
            }
            return mediaStream;
          });

          if (userVideoRef.current) {
            userVideoRef.current.srcObject = mediaStream;
          }

          if (strangerPeerId) {
            const call = peerInstance.current?.call(
              strangerPeerId,
              mediaStream
            );

            call?.on("stream", (stream) => {
              if (strangerVideoRef.current) {
                strangerVideoRef.current.srcObject = stream;
                setIsStrangerHasStream(true);
              }
            });
          }
        })
        .catch((error) => {
          console.error("Error accessing media devices.", error);
        });
    }
  }, [withVideo, strangerPeerId]);

  // Stranger video
  useEffect(() => {
    peerInstance.current?.on("call", (call) => {
      if (!userMediaStream) {
        return;
      }

      call.answer(userMediaStream);

      call.on("stream", (stream) => {
        if (strangerVideoRef.current) {
          strangerVideoRef.current.srcObject = stream;
          setIsStrangerHasStream(true);
        }
      });
    });

    return () => {
      peerInstance.current?.off("call");
    };
  }, [userMediaStream]);

  // clean up
  useEffect(() => {
    return () => {
      if (userMediaStream) {
        userMediaStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [userMediaStream]);

  const newChat = () => {
    socket.emit("disconnect-pair");

    setIsStrangerHasStream(false);
    setMessages([]);
    setStranger(null);
    setChatStatus(ChatStatus.CONNECTING);

    if (withVideo) {
      socket.emit("find-video-pair");
    } else {
      socket.emit("find-pair");
    }
  };

  const sendMessage = (messageInput: string) => {
    if (!socket) {
      return;
    }

    const newMessage: MessageType = { sender: "me", content: messageInput };
    setMessages([...messages, newMessage]);

    socket.emit("send-message", newMessage);

    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView();
    }
  };

  return (
    <ChatContainer
      chatStatus={chatStatus}
      newChat={newChat}
      sendMessage={sendMessage}
    >
      {withVideo && (
        <ChatContainer.Video>
          <div className="flex-1 h-full rounded-lg overflow-hidden">
            <video
              ref={userVideoRef}
              className={`w-full h-full object-cover ${
                userMediaStream ? "block" : "hidden"
              }`}
              autoPlay
              playsInline
              muted
            ></video>

            {!userMediaStream && (
              <div className="w-full h-full p-3 flex justify-center items-center bg-neutral text-base-100 text-lg font-bold text-center">
                <div className="loading loading-spinner loading-lg" />
              </div>
            )}
          </div>

          <div className="flex-1 h-full rounded-lg overflow-hidden">
            <video
              ref={strangerVideoRef}
              className={`w-full h-full object-cover ${
                isStrangerHasStream ? "block" : "hidden"
              }`}
              autoPlay
              playsInline
            ></video>

            {!isStrangerHasStream && (
              <div className="w-full h-full p-3 flex justify-center items-center bg-neutral text-base-100 text-lg font-bold text-center">
                {chatStatus === ChatStatus.CONNECTED ? (
                  <div className="loading loading-spinner loading-lg" />
                ) : chatStatus === ChatStatus.CONNECTING ? (
                  "Connecting to stranger..."
                ) : (
                  `${stranger?.name} left.`
                )}
              </div>
            )}
          </div>
        </ChatContainer.Video>
      )}

      <ChatContainer.Chat>
        {stranger && (
          <>
            <ChatBubbleInfo
              sender="me"
              name={user.name}
              age={user.age}
              sex={user.sex}
              location={user.location}
            />

            <ChatBubbleInfo
              sender="stranger"
              name={stranger.name}
              age={stranger.age}
              sex={stranger.sex}
              location={stranger.location}
            />
          </>
        )}

        {messages.map((content, index) => (
          <ChatBubble
            key={index}
            sender={content.sender}
            user={content.sender === "me" ? user : stranger!}
            message={content.content}
          />
        ))}

        {chatStatus === ChatStatus.DISCONNECTED && (
          <SystemChatBubble
            status="error"
            message={
              <>
                <span className="font-bold">"{user.name}"</span> left.
              </>
            }
          />
        )}

        <div ref={chatEndRef}></div>
      </ChatContainer.Chat>
    </ChatContainer>
  );
};

export default RandomChat;
