import { useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { userAtom } from "../store";
import { socket } from "../config/socket";
import ChatBubbleInfo from "../components/ChatBubbleInfo";
import ChatBubble from "../components/ChatBubble";
import IUser from "../types/IUser";

type MessageType = { sender: "me" | "stranger"; content: string };

const Chat = () => {
  const navigate = useNavigate();
  const [user] = useAtom(userAtom);
  const [stranger, setStranger] = useState<IUser | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isConfirmNewChat, setIsConfirmNewChat] = useState(false);
  const [isStrangerLeft, setIsStrangerLeft] = useState(false);

  const newButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (user.name === "") {
      navigate("/");
    }

    socket.connect();
    console.log("Socket connected with ID: " + socket.id);

    socket.emit("find-pair");

    socket.on("pair-found", () => {
      console.log("Pair found");
      socket.emit("exchange-info", user);
    });

    socket.on("receive-info", (info: IUser) => {
      console.log("Received info from stranger", info);
      setStranger(info);
    });

    socket.on("receive-message", (message: MessageType) => {
      message.sender = "stranger";
      console.log("Received message from stranger", message);

      setMessages((prev) => [...prev, message]);
    });

    socket.on("pair-disconnected", () => {
      console.log("Stranger disconnected");
      setIsStrangerLeft(true);
    });

    return () => {
      console.log("Chat component unmounted, disconnecting socket");
      socket.disconnect();
      socket.off("connect");
      socket.off("pair-found");
      socket.off("receive-info");
      socket.off("receive-message");
      socket.off("pair-disconnected");
    };
  }, [navigate, user]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      newButtonRef.current &&
      !newButtonRef.current.contains(event.target as Node)
    ) {
      setIsConfirmNewChat(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const newChat = () => {
    if (!isConfirmNewChat && !isStrangerLeft) {
      setIsConfirmNewChat(true);
      return;
    }

    socket.emit("disconnect-pair");

    setMessages([]);
    setIsConfirmNewChat(false);
    setStranger(null);
    setIsStrangerLeft(false);

    socket.emit("find-pair");
  };

  const sendMessage = () => {
    if (messageInput === "" || !socket) {
      return;
    }

    const newMessage: MessageType = { sender: "me", content: messageInput };
    setMessages([...messages, newMessage]);
    setMessageInput("");
    socket.emit("send-message", newMessage);
  };

  return (
    <div className="max-w-[800px] h-screen mx-auto px-3 py-6 flex flex-col gap-2">
      <div className="mb-3 flex items-center">
        <div className="flex-1 flex items-center">
          <button
            className="btn btn-square"
            aria-label="Back"
            onClick={() => {
              socket.disconnect();
              navigate("/");
            }}
          >
            <FaArrowLeft />
          </button>
        </div>

        <h1 className="flex-1 text-4xl text-center font-bold">
          Link
          <span className="ml-1 p-1 bg-primary text-base-100 rounded-lg">
            Up
          </span>
        </h1>

        <div className="flex-1"></div>
      </div>

      {/* Chat */}
      <div className="flex-1 border-[1px] rounded-box border-base-300 px-2 py-3 overflow-y-scroll">
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
      </div>

      {/* Chat bar */}
      <div className="w-full flex gap-2">
        <button
          ref={newButtonRef}
          className="w-16 btn"
          disabled={!stranger}
          onClick={newChat}
        >
          {isConfirmNewChat ? "Sure?" : "New"}
        </button>

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={
            isStrangerLeft
              ? "Pair disconnected"
              : stranger
              ? `Chat with ${stranger.name}`
              : "Finding a pair..."
          }
          disabled={!stranger || isStrangerLeft}
          value={!stranger || isStrangerLeft ? "" : messageInput}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          onChange={(e) => setMessageInput(e.target.value)}
        />

        <button
          className="btn btn-primary"
          disabled={!stranger || messageInput === "" || isStrangerLeft}
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
