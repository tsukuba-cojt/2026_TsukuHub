import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createClient } from "@supabase/supabase-js";
import "../../styles/AI_agent/FloatingAgentChat.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

type Source = {
  title: string;
  url: string;
};

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
};

const INITIAL_MESSAGE: Message = {
  id: 1,
  role: "assistant",
  text: "こんにちは。履修・サークル・就活について相談できます。",
};

function FloatingAgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, isLoading, messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: trimmedInput,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/course-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: publishableKey,
            Authorization: `Bearer ${accessToken ?? publishableKey}`,
          },
          body: JSON.stringify({
            message: userMessage.text,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || typeof data.answer !== "string") {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: data.answer,
        sources: Array.isArray(data.sources)
          ? data.sources.filter(
              (source: unknown): source is Source =>
                typeof source === "object" &&
                source !== null &&
                typeof (source as Source).title === "string" &&
                typeof (source as Source).url === "string" &&
                /^https?:\/\//i.test((source as Source).url),
            )
          : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to fetch course-agent response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: "AIからの返信取得に失敗しました。時間をおいて再度お試しください。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="floating-agent-chat">
      {isOpen && (
        <div className="floating-agent-chat__panel">
          <div className="floating-agent-chat__header">
            <div>
              <h2 className="floating-agent-chat__title">TsukuHub AI</h2>
              <p className="floating-agent-chat__subtitle">
                履修・サークル・就活を相談できます
              </p>
            </div>
            <button
              aria-label="チャットを閉じる"
              className="floating-agent-chat__close-button"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ×
            </button>
          </div>

          <div className="floating-agent-chat__messages">
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  className={`floating-agent-chat__message-row ${
                    isUser
                      ? "floating-agent-chat__message-row--user"
                      : "floating-agent-chat__message-row--assistant"
                  }`}
                  key={message.id}
                >
                  <div
                    className={`floating-agent-chat__message ${
                      isUser
                        ? "floating-agent-chat__message--user"
                        : "floating-agent-chat__message--assistant"
                    }`}
                  >
                    {message.text}
                    {message.sources && message.sources.length > 0 && (
                      <div className="floating-agent-chat__sources">
                        <span className="floating-agent-chat__sources-label">
                          参照元
                        </span>
                        {message.sources.map((source) => (
                          <a
                            href={source.url}
                            key={source.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="floating-agent-chat__message-row floating-agent-chat__message-row--assistant">
                <div className="floating-agent-chat__message floating-agent-chat__message--loading">
                  AIが考えています...
                </div>
              </div>
            )}
            <div aria-hidden="true" ref={messagesEndRef} />
          </div>

          <form className="floating-agent-chat__form" onSubmit={handleSubmit}>
            <input
              aria-label="AIチャットへのメッセージ"
              className="floating-agent-chat__input"
              onChange={(event) => setInput(event.target.value)}
              placeholder="相談内容を入力"
              type="text"
              value={input}
            />
            <button
              className="floating-agent-chat__send-button"
              disabled={isLoading || input.trim().length === 0}
              type="submit"
            >
              送信
            </button>
          </form>
        </div>
      )}

      <button
        aria-label="AIチャットを開く"
        className="floating-agent-chat__open-button"
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
        type="button"
      >
        AI
      </button>
    </div>
  );
}

export default FloatingAgentChat;
