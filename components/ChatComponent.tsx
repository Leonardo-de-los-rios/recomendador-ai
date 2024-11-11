"use client";
import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function ChatComponent() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    // Guardar el mensaje del usuario antes de vaciar el campo
    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    // Limpiar el campo de entrada inmediatamente después de agregar el mensaje
    setPrompt("");

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt, // Usamos el valor antes de limpiarlo
        }),
      });

      if (!res.ok) throw new Error("Error en la solicitud");

      const data = await res.json();

      // Agregar respuesta del modelo
      const assistantMessage: Message = {
        role: "model",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // En caso de error, agregamos un mensaje de error como respuesta
      const errorMessage: Message = {
        role: "model",
        content:
          "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        return;
      } else {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setPrompt("");
  };

  // Scroll al final cada vez que el mensaje cambie
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Recomendador IA</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col">
        {/* Historial de mensajes */}
        <div className="flex-grow overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-50 border border-blue-100"
                  : "bg-gray-50 border border-gray-100 shadow-inner"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-gray-500">
                  {message.role === "user" ? "Tú:" : "IA:"}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-gray-700">
                {message.content}
              </p>
            </div>
          ))}
          {/* Ref de desplazamiento para mantener el scroll al final */}
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="¿Qué te gustaría preguntar? (Enter para enviar, Shift + Enter para nueva línea)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[100px] p-4 resize-none pr-24"
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              Enter ↵ enviar | Shift + Enter nueva línea
            </div>
          </div>

          <div className="flex justify-between items-center space-x-4 w-full">
            {/* Botón de borrar historial */}
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearChat}
                className="h-8 w-8"
                title="Limpiar conversación"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            {/* Botón de enviar, siempre a la derecha */}
            <div className="flex justify-end w-full">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !prompt.trim()}
                className="w-24"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
