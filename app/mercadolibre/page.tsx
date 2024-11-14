"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

const MercadoLibrePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [apiUrl, setApiUrl] = useState(
    "https://api.mercadolibre.com/sites/MLA/search?q="
  );
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSearchResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResult(null);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>API MercadoLibre</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="name">Nombre del producto</Label>
            </div>
            <Input
              id="name"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setApiUrl(
                  `https://api.mercadolibre.com/sites/MLA/search?q=${e.target.value.replace(
                    /\s/g,
                    "+"
                  )}`
                );
              }}
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="url">API URL</Label>
            </div>
            <Input id="url" value={apiUrl} readOnly />
          </div>
          <div className="flex justify-between items-center gap-2">
            {searchTerm && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearSearch}
                className="h-8 w-8"
                title="Limpiar conversación"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-grow" />

            <Button
              onClick={handleSearch}
              disabled={
                searchTerm.length < 3 || isLoading || !searchTerm.trim()
              }
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
        {searchResult && (
          <div className="mt-6">
            <h2 className="text-xl font-bold">Resultado</h2>
            <pre className="bg-gray-100 p-4 rounded-md h-96 overflow-y-auto">
              {JSON.stringify(searchResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MercadoLibrePage;
