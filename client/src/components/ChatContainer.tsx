import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { socket } from "../config/socket";
import IUser from "../types/IUser";

enum ChatStatus {
  CONNECTING,
  CONNECTED,
  DISCONNECTED,
}

interface ChatContainerProps {
  children?: React.ReactNode;
  chatStatus: ChatStatus;
  members?: { [key: string]: IUser };
  sendMessage: (msg: string) => void;
  newChat?: () => void;
}

const ChatContainer = ({
  children,
  chatStatus,
  members,
  sendMessage,
  newChat,
}: ChatContainerProps) => {
  const navigate = useNavigate();

  const membersModalRef = useRef<HTMLDialogElement>(null);
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

  const handleSendMessage = () => {
    if (messageInput === "") {
      return;
    }

    sendMessage(messageInput);
    setMessageInput("");
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

        <div className="flex-1 flex justify-end">
          {members && (
            <>
              {Object.keys(members).length > 0 && (
                <button
                  className="btn"
                  onClick={() => membersModalRef.current?.showModal()}
                >
                  {Object.keys(members).length} member
                  {Object.keys(members).length > 1 ? "s" : ""}
                </button>
              )}

              <dialog ref={membersModalRef} className="modal">
                <div className="modal-box">
                  <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                      ✕
                    </button>
                  </form>

                  <h3 className="font-bold text-lg">
                    Member{Object.keys(members).length > 1 ? "s" : ""}
                  </h3>

                  <p className="py-4 overflow-scroll">
                    <table className="table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Name</th>
                          <th>Sex</th>
                          <th>Location</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.keys(members).map((key, index) => (
                          <tr key={key}>
                            <td>{index + 1}</td>
                            <td>{members[key].name}</td>
                            <td>{members[key].sex}</td>
                            <td>{members[key].location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </p>
                </div>

                <form method="dialog" className="modal-backdrop">
                  <button>close</button>
                </form>
              </dialog>
            </>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
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
              handleSendMessage();
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
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

ChatContainer.Chat = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex flex-col-reverse border-[1px] rounded-box border-base-300 px-2 py-3 overflow-y-scroll">
      <div className="flex-grow">{children}</div>
    </div>
  );
};

ChatContainer.Video = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-[560px] md:h-72 flex flex-col md:flex-row gap-3">
      {children}
    </div>
  );
};

export default ChatContainer;
export type { ChatContainerProps };
export { ChatStatus };
