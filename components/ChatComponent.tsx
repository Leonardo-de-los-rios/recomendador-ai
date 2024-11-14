"use client";

import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Trash2, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ModelOption {
  id: string;
  name: string;
  value: string;
}

const modelOptions: ModelOption[] = [
  {
    id: "v1",
    name: "Smartphones v1",
    value: "tunedModels/smartphones-xrjir1ho6s6g",
  },
  {
    id: "v2",
    name: "Smartphones v2",
    value: "tunedModels/smartphonesv2-yxq6u1pzn0q1",
  },
  {
    id: "v3",
    name: "Smartphones v3",
    value: "tunedModels/smartphonesv3-c1tbmvftfdi3",
  },
  {
    id: "v4",
    name: "Smartphones v4",
    value: "tunedModels/smartphonesv4-n7q1nczw35jf",
  },
];

export default function ChatComponent() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(modelOptions[3].value);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    setIsLoading(true);
    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      });

      if (!res.ok) throw new Error("Error en la solicitud");

      const data = await res.json();

      const assistantMessage: Message = {
        role: "model",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error en la solicitud:", error);
      const errorMessage: Message = {
        role: "model",
        content:
          "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Hacer focus en el textarea después de recibir la respuesta
      setTimeout(() => textareaRef.current?.focus(), 100);
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
    textareaRef.current?.focus();
  };

  // Autofocus inicial
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Obtener el nombre del modelo actual
  const getCurrentModelName = () => {
    const currentModel = modelOptions.find(
      (model) => model.value === selectedModel
    );
    return currentModel?.name || "Modelo no seleccionado";
  };

  // Manejar la selección del modelo
  const handleModelSelect = (modelValue: string) => {
    setSelectedModel(modelValue);
    setIsPopoverOpen(false); // Cerrar el popover después de seleccionar
    textareaRef.current?.focus(); // Volver el focus al textarea
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Recomendador de Celulares con IA</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col">
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
          <div ref={messagesEndRef} />
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Dime tus preferencias y presupuesto!"
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

          <div className="flex justify-between items-center gap-2">
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

            <div className="flex-grow" />

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {getCurrentModelName()}
              </span>

              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    title="Cambiar modelo"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Seleccionar Modelo</h4>
                    <div className="grid gap-2">
                      {modelOptions.map((option) => (
                        <Button
                          key={option.id}
                          variant={
                            selectedModel === option.value
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start"
                          onClick={() => handleModelSelect(option.value)}
                        >
                          {option.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

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
      </CardContent>
    </Card>
  );
}
