import { Sex } from "@/types/user";

interface ChatBubbleInfoProps {
  sender: "me" | "stranger";
  name: string;
  age: number | null;
  sex: Sex;
  location: string;
}

export default function ChatBubbleInfo({
  sender,
  name,
  age,
  sex,
  location,
}: ChatBubbleInfoProps) {
  return (
    <div className={`chat ${sender === "me" ? "chat-end" : "chat-start"}`}>
      <div
        className={
          "chat-bubble" + (sender === "me" ? " chat-bubble-primary" : "")
        }
      >
        <span className="font-bold">&quot;{name}&quot;</span> has joined the
        chat
        <br />
        <span className="text-sm ">
          <span className="font-bold">ASL:</span> {age ?? "~"}/
          {sex === "" ? "~" : sex}/{location === "" ? "~" : location}
        </span>
      </div>
    </div>
  );
}
