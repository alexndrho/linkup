interface ChatBubbleProps {
  sender: "me" | "stranger";
  name: string;
  message: string;
}

const ChatBubble = ({ sender, name, message }: ChatBubbleProps) => {
  return (
    <div className={`chat ${sender === "me" ? "chat-end" : "chat-start"}`}>
      <div
        className={
          "chat-bubble" + (sender === "me" ? " chat-bubble-primary" : "")
        }
      >
        <p className="text-sm font-bold">{name}</p>
        {message}
      </div>
    </div>
  );
};

export default ChatBubble;
export type { ChatBubbleProps };
