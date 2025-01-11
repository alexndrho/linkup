import { useRef } from "react";
import IUser from "../types/IUser";

interface ChatBubbleProps {
  sender: "me" | "stranger";
  user: IUser;
  message: string | React.ReactNode;
}

const ChatBubble = ({ sender, user, message }: ChatBubbleProps) => {
  const userModalRef = useRef<HTMLDialogElement>(null);

  return (
    <div className={`chat ${sender === "me" ? "chat-end" : "chat-start"}`}>
      <div className="chat-header">{user.name}</div>

      <button
        className={
          "chat-bubble" + (sender === "me" ? " chat-bubble-primary" : "")
        }
        onClick={() => {
          userModalRef.current?.showModal();
        }}
      >
        {message}
      </button>

      <dialog ref={userModalRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg">{user.name}</h3>
          <div className="py-4">
            {user.age && (
              <p>
                <span className="text-sm font-semibold">Age:</span> {user.age}
              </p>
            )}
            {user.sex && (
              <p>
                <span className="text-sm font-semibold">Sex:</span> {user.sex}
              </p>
            )}
            {user.location && (
              <p>
                <span className="text-sm font-semibold">Location:</span>{" "}
                {user.location}
              </p>
            )}

            {!user.age && !user.sex && !user.location && (
              <p className="text-center text-gray-500">
                No information available.
              </p>
            )}
          </div>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default ChatBubble;
export type { ChatBubbleProps };
