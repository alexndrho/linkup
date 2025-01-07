interface SystemChatBubbleProps {
  status: "success" | "info" | "warning" | "error";
  message: string | React.ReactNode;
}

const SystemChatBubble = ({ status, message }: SystemChatBubbleProps) => {
  return (
    <div className="my-2 flex flex-col justify-center items-center">
      <div className={`badge badge-${status}`}>{message}</div>
    </div>
  );
};

export default SystemChatBubble;
export type { SystemChatBubbleProps };
