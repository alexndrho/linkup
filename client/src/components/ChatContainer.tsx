import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { socket } from "../config/socket";

enum ChatStatus {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}

interface ChatContainerProps {
  children?: React.ReactNode;
  chatStatus: ChatStatus;
  sendMessage: (msg: string) => void;
  newChat?: () => void;
}

const ChatContainer = ({
  children,
  chatStatus,
  sendMessage,
  newChat,
}: ChatContainerProps) => {
  const navigate = useNavigate();

  const newButtonRef = useRef<HTMLButtonElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConfirmNewChat, setIsConfirmNewChat] = useState(false);

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

  const handleNewChat = () => {
    if (!newChat) {
      return;
    }

    if (!isConfirmNewChat && chatStatus === ChatStatus.CONNECTED) {
      setIsConfirmNewChat(true);
      return;
    }

    setIsConfirmNewChat(false);
    setMessageInput("");

    newChat();
  };

  const handleSendMesssage = () => {
    sendMessage(messageInput);
    setMessageInput("");
  };

  return (
    <>
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
        {children}
      </div>

      {/* Chat bar */}
      <div className="w-full flex gap-2">
        {newChat && (
          <button
            ref={newButtonRef}
            className="w-16 btn"
            disabled={
              chatStatus !== ChatStatus.CONNECTED &&
              chatStatus !== ChatStatus.DISCONNECTED
            }
            onClick={handleNewChat}
          >
            {isConfirmNewChat ? "Sure?" : "New"}
          </button>
        )}

        <input
          type="text"
          className="input input-bordered w-full"
          placeholder={
            chatStatus === ChatStatus.CONNECTED
              ? "Type a message"
              : chatStatus === ChatStatus.CONNECTING
              ? "Connecting..."
              : "Pair disconnected"
          }
          disabled={chatStatus !== ChatStatus.CONNECTED}
          value={messageInput}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSendMesssage();
            }
          }}
          onChange={(e) => {
            setIsConfirmNewChat(false);
            setMessageInput(e.target.value);
          }}
        />

        <button
          className="btn btn-primary"
          disabled={chatStatus !== ChatStatus.CONNECTED || messageInput === ""}
          onClick={handleSendMesssage}
        >
          Send
        </button>
      </div>
    </>
  );
};

export default ChatContainer;
export type { ChatContainerProps };
export { ChatStatus };
