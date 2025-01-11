import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { userAtom } from "../store";
import { roomSocket } from "../config/socket";
import ChatContainer, { ChatStatus } from "../components/ChatContainer";
import ChatBubble from "../components/ChatBubble";
import SystemChatBubble from "../components/SystemChatBubble";
import IUser from "../types/IUser";

type UserMessageType = {
  sender: "me" | "stranger";
  user: IUser;
  content: string | React.ReactNode;
};

type SystemMessageType = {
  sender: "system";
  status: "success" | "info" | "error";
  content: string | React.ReactNode;
};

type MessageType = UserMessageType | SystemMessageType;

const Public = () => {
  const navigate = useNavigate();

  const [user] = useAtom(userAtom);
  const [members, setMembers] = useState<{ [key: string]: IUser }>({});
  const [chatStatus, setChatStatus] = useState(ChatStatus.CONNECTING);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (user.name === "") {
      navigate("/");
    }

    roomSocket.connect();

    roomSocket.emit("join-room", "public", user, () => {
      setChatStatus(ChatStatus.CONNECTED);
    });

    roomSocket.on("user-connected", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          status: "success",
          content: (
            <>
              <span className="font-bold">"{user.name}"</span> joined.
            </>
          ),
        },
      ]);
    });

    roomSocket.on("receive-members", (members: { [key: string]: IUser }) => {
      console.log(members);

      setMembers(members);
    });

    roomSocket.on("receive-message", (user: IUser, message: string) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "stranger",
          user,
          content: message,
        },
      ]);
    });

    roomSocket.on("user-disconnected", (user) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "system",
          status: "error",
          content: (
            <>
              <span className="font-bold">"{user.name}"</span> left.
            </>
          ),
        },
      ]);
    });

    return () => {
      roomSocket.disconnect();

      roomSocket.off("user-connected");
      roomSocket.off("receive-members");
      roomSocket.off("receive-message");
      roomSocket.off("user-disconnected");
    };
  }, [navigate, user]);

  const sendMessage = (msg: string) => {
    const message: MessageType = {
      sender: "me",
      user,
      content: msg,
    };

    setMessages((prev) => [...prev, message]);

    roomSocket.emit("send-message", "public", msg);
  };

  return (
    <div className="max-w-[800px] h-screen mx-auto px-3 py-6 flex flex-col gap-2">
      <ChatContainer
        chatStatus={chatStatus}
        members={members}
        sendMessage={sendMessage}
      >
        <ChatContainer.Chat>
          {messages.map((message, index) => (
            <>
              {message.sender === "me" || message.sender === "stranger" ? (
                <ChatBubble
                  key={index}
                  sender={message.sender}
                  user={message.user}
                  message={message.content}
                />
              ) : (
                message.sender === "system" && (
                  <SystemChatBubble
                    key={index}
                    status={message.status}
                    message={message.content}
                  />
                )
              )}
            </>
          ))}
        </ChatContainer.Chat>
      </ChatContainer>
    </div>
  );
};

export default Public;
