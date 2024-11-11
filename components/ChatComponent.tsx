"use client";
import { useState, KeyboardEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

export default function ChatComponent() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Error en la solicitud");

      const data = await res.json();
      setResponse(data.message);
      setPrompt(""); // Limpiar el campo de entrada después de enviar
    } catch (error) {
      setResponse(
        "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Maneja la pulsación de teclas para envío con Enter y salto de línea con Shift + Enter
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift + Enter: permitir el comportamiento por defecto (nueva línea)
        return;
      } else {
        // Solo Enter: enviar el formulario
        e.preventDefault(); // Prevenir nueva línea
        handleSubmit();
      }
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Recomendador IA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
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

            <div className="flex justify-end">
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

          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Respuesta:</h3>
              <div className="bg-gray-50 rounded-lg p-4 shadow-inner">
                <p className="whitespace-pre-wrap text-gray-700">{response}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
