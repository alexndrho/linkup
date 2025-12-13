"use client";

import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";

import { socket } from "@/config/socket";
import { userAtom } from "@/lib/store";
import ChatBubbleInfo from "../components/ChatBubbleInfo";
import ChatBubble from "../components/ChatBubble";
import ChatContainer from "../components/ChatContainer";
import SystemChatBubble from "../components/SystemChatBubble";
import { type IUser } from "@/types/user";
import { ChatStatus } from "@/types/chat";

type MessageType = { sender: "me" | "stranger"; content: string };

interface RandomChatProps {
  withVideo?: boolean;
}

const RandomChat = ({ withVideo }: RandomChatProps) => {
  const router = useRouter();

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
    if (user.name.trim() === "") {
      router.push("/");
      return;
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

        peer.on("open", (id: string) => {
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
  }, [router, user, withVideo]);

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

  useEffect(() => {
    if (messages.length <= 0) return;

    if (chatEndRef.current && messages[messages.length - 1].sender === "me") {
      chatEndRef.current.scrollIntoView();
    }
  }, [messages]);

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
  };

  return (
    <ChatContainer
      chatStatus={chatStatus}
      newChat={newChat}
      sendMessage={sendMessage}
    >
      {/* With Video */}
      {withVideo && (
        <div className="relative flex-1 md:flex-none w-full md:h-72 flex flex-col-reverse md:flex-row gap-2">
          <div className="flex-1 h-full rounded-lg overflow-hidden">
            <video
              ref={userVideoRef}
              className={`w-full h-full object-cover scale-x-[-1] ${
                userMediaStream ? "block" : "hidden"
              }`}
              autoPlay
              playsInline
              muted
            />

            <div className="w-full h-full p-3 flex justify-center items-center bg-neutral text-base-100 text-lg font-bold text-center">
              <div className="loading loading-spinner loading-lg" />
            </div>
          </div>

          <div className="flex-1 h-full rounded-lg overflow-hidden">
            <video
              ref={strangerVideoRef}
              className={`w-full h-full object-cover scale-x-[-1] ${
                isStrangerHasStream ? "block" : "hidden"
              }`}
              autoPlay
              playsInline
            />

            <div className="w-full h-full p-3 flex justify-center items-center bg-neutral text-base-100 text-lg font-bold text-center">
              {chatStatus === ChatStatus.CONNECTED ? (
                <div className="loading loading-spinner loading-lg" />
              ) : chatStatus === ChatStatus.CONNECTING ? (
                "Connecting to stranger..."
              ) : (
                `${stranger?.name} left.`
              )}
            </div>
          </div>

          <div className="md:hidden absolute bottom-0 w-full h-80 p-3 flex flex-col justify-end text-base-100 overflow-hidden">
            {stranger && (
              <div className="animate-fade-out">
                <span className="font-bold">{stranger.name}</span>:{" "}
                {stranger.age ?? "~"}/{stranger.sex === "" ? "~" : stranger.sex}
                /{stranger.location === "" ? "~" : stranger.location}
              </div>
            )}

            {messages.map((content, index) => (
              <div key={index} className="animate-fade-out">
                <span className="font-bold">
                  {content.sender === "me" ? user.name : stranger?.name}
                </span>
                : {content.content}
              </div>
            ))}

            {chatStatus === ChatStatus.DISCONNECTED && (
              <div className="animate-fade-out">
                <span className="font-bold">{stranger?.name}</span> left.
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`flex-1 flex flex-col-reverse px-2 py-3 border border-base-300 rounded-box overflow-y-scroll ${
          withVideo ? "hidden md:flex" : ""
        }`}
      >
        <div className="grow">
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
                  <span className="font-bold">
                    &quot;{stranger?.name}&quot;
                  </span>{" "}
                  left.
                </>
              }
            />
          )}

          <div ref={chatEndRef}></div>
        </div>
      </div>
    </ChatContainer>
  );
};

export default RandomChat;
