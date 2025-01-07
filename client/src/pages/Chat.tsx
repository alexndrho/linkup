import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { userAtom } from "../store";
import { socket } from "../config/socket";
import ChatBubbleInfo from "../components/ChatBubbleInfo";
import ChatBubble from "../components/ChatBubble";
import IUser from "../types/IUser";
import ChatContainer, { ChatStatus } from "../components/ChatContainer";

type MessageType = { sender: "me" | "stranger"; content: string };

const Chat = () => {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [stranger, setStranger] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isStrangerLeft, setIsStrangerLeft] = useState(false);

  useEffect(() => {
    if (user.name === "") {
      navigate("/");
    }

    socket.connect();

    socket.emit("find-pair");

    socket.on("pair-found", () => {
      socket.emit("exchange-info", user);
    });

    socket.on("receive-info", (info: IUser) => {
      setStranger(info);
    });

    socket.on("receive-message", (message: MessageType) => {
      message.sender = "stranger";

      setMessages((prev) => [...prev, message]);
    });

    socket.on("pair-disconnected", () => {
      setIsStrangerLeft(true);
    });

    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("pair-found");
      socket.off("receive-info");
      socket.off("receive-message");
      socket.off("pair-disconnected");
    };
  }, [navigate, user]);

  const newChat = () => {
    socket.emit("disconnect-pair");

    setMessages([]);
    setStranger(null);
    setIsStrangerLeft(false);

    socket.emit("find-pair");
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
    <div className="max-w-[800px] h-screen mx-auto px-3 py-6 flex flex-col gap-2">
      <ChatContainer
        chatStatus={
          stranger
            ? isStrangerLeft
              ? ChatStatus.DISCONNECTED
              : ChatStatus.CONNECTED
            : ChatStatus.CONNECTING
        }
        newChat={newChat}
        sendMessage={sendMessage}
      >
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
            name={content.sender === "me" ? user.name : stranger?.name ?? ""}
            message={content.content}
          />
        ))}

        {isStrangerLeft && (
          <div className="my-2 flex flex-col justify-center items-center">
            <div className="badge badge-error">
              <span className="font-bold">"{stranger?.name}"</span> left.
            </div>
          </div>
        )}
      </ChatContainer>
    </div>
  );
};

export default Chat;
