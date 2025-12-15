"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useHotkeys, useThrottledCallback } from "@mantine/hooks";
import { FaArrowLeft } from "react-icons/fa";

import { IUser } from "@/types/user";
import { ChatStatus } from "@/types/chat";
import { socket } from "@/config/socket";

export interface ChatContainerProps {
  children?: React.ReactNode;
  chatStatus: ChatStatus;
  members?: { [key: string]: IUser };
  sendMessage: (msg: string) => void;
  newChat?: () => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
}

export default function ChatContainer({
  children,
  chatStatus,
  members,
  sendMessage,
  newChat,
  onTyping,
  onStopTyping,
}: ChatContainerProps) {
  const membersModalRef = useRef<HTMLDialogElement>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConfirmNewChat, setIsConfirmNewChat] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleTyping = useThrottledCallback(() => {
    if (onTyping) onTyping();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) onStopTyping();
    }, 2000); // 2 seconds after last input
  }, 1000);

  const handleSendMessage = () => {
    if (messageInput === "") {
      return;
    }

    sendMessage(messageInput);
    setMessageInput("");
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onStopTyping) onStopTyping();
  };

  useHotkeys([["Escape", () => handleNewChat()]], []);

  return (
    <div className="max-w-200 h-dvh mx-auto px-3 py-6 flex flex-col gap-2">
      <div className="mb-3 flex items-center">
        <div className="flex-1 flex items-center">
          <Link
            href="/"
            className="btn btn-square"
            aria-label="Back"
            onClick={() => {
              socket.disconnect();
            }}
          >
            <FaArrowLeft />
          </Link>
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

                  <div className="py-4 overflow-scroll">
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
                  </div>
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
      {children}

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
              if (onStopTyping) onStopTyping();
            }
          }}
          onChange={(e) => {
            setIsConfirmNewChat(false);
            setMessageInput(e.target.value);
            handleTyping();
          }}
          onBlur={() => {
            if (onStopTyping) onStopTyping();
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
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
}

ChatContainer.Chat = function Chat({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col-reverse px-2 py-3 border border-base-300 rounded-box overflow-y-scroll">
      <div className="grow">{children}</div>
    </div>
  );
};
