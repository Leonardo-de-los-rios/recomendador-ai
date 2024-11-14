"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info, CheckCircle, Loader2 } from "lucide-react";

interface Model {
  id: string;
  baseModel: string;
  trainingTime: string;
  optimizedExamples: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  createdAt: string;
}

interface FormData {
  name: string;
  baseModel: string;
  epochs: string;
  learningRateMultiplier: string;
  batchSize: string;
  trainingFile: File | null;
}

type FileStatus = "none" | "loading" | "approved";

const baseModels = [
  {
    model: "models/gemini-1.5-flash-001-tuning",
    name: "gemini-1.5-flash-001-tuning",
  },
  { model: "models/gemini-1.0-pro-001", name: "gemini-1.0-pro-001" },
];

export default function AIModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    baseModel: "models/gemini-1.5-flash-001-tuning",
    epochs: "",
    learningRateMultiplier: "",
    batchSize: "",
    trainingFile: null,
  });
  const [fileStatus, setFileStatus] = useState<FileStatus>("none");

  useEffect(() => {
    // Load models from JSON file
    const loadModels = async () => {
      try {
        const response = await fetch("/tuned-models.json");
        const data = await response.json();
        setModels(data.models);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    loadModels();
  }, []);

  const isFormValid = () => {
    return (
      formData.name &&
      formData.baseModel &&
      parseFloat(formData.epochs) > 0 &&
      parseFloat(formData.learningRateMultiplier) > 0 &&
      parseFloat(formData.batchSize) > 0 &&
      formData.trainingFile &&
      fileStatus === "approved"
    );
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        trainingFile: file,
      }));
      setFileStatus("loading");

      // Simulate file processing
      setTimeout(() => {
        setFileStatus("approved");
      }, 5000);
    } else {
      setFormData((prev) => ({
        ...prev,
        trainingFile: null,
      }));
      setFileStatus("none");
    }
  };

  const handleSubmit = async () => {
    // Create new model object
    function generateRandomId(length: number) {
      const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    }

    const newModel: Model = {
      id: `tunedModels/${formData.name.toLowerCase()}-${generateRandomId(12)}`,
      baseModel: formData.baseModel.includes("1.5")
        ? "Gemini 1.5 Flash 001 Tuning"
        : "Gemini 1.0 Pro 001",
      trainingTime: "0m 0s", // This would be updated after actual training
      optimizedExamples: 0, // This would be updated after processing
      epochs: parseInt(formData.epochs),
      batchSize: parseInt(formData.batchSize),
      learningRate: parseFloat(formData.learningRateMultiplier),
      createdAt: new Date().toISOString(),
    };

    // Update models state
    setModels((prev) => [...prev, newModel]);

    // Reset form and close modal
    setFormData({
      name: "",
      baseModel: "models/gemini-1.5-flash-001-tuning",
      epochs: "",
      learningRateMultiplier: "",
      batchSize: "",
      trainingFile: null,
    });
    setFileStatus("none");
    setIsModalOpen(false);

    // In a real application, you would also update the JSON file here
    // This would typically be handled by an API endpoint
  };

  const FileStatusIcon = () => {
    switch (fileStatus) {
      case "loading":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "approved":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Modelos de IA</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>Crear Nuevo Modelo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Modelo</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Nombre del Modelo */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Modelo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ingrese el nombre del modelo"
                />
              </div>

              {/* Modelo Base */}
              <div className="space-y-2">
                <Label>Modelo Base</Label>
                <Select
                  value={formData.baseModel}
                  onValueChange={(value) =>
                    handleInputChange("baseModel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un modelo base" />
                  </SelectTrigger>
                  <SelectContent>
                    {baseModels.map((model) => (
                      <SelectItem key={model.model} value={model.model}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Épocas de afinación */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="epochs">Épocas de afinación</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p className="max-w-xs">
                          La cantidad de veces que el modelo procesa cada
                          ejemplo de los datos de entrenamiento una vez.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="epochs"
                  type="number"
                  min="1"
                  value={formData.epochs}
                  onChange={(e) => handleInputChange("epochs", e.target.value)}
                />
              </div>

              {/* Multiplicador de tasa de aprendizaje */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="learningRate">
                    Multiplicador de tasa de aprendizaje
                  </Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p className="max-w-xs">
                          Factor para ajustar la tasa de aprendizaje
                          predeterminada
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="learningRate"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.learningRateMultiplier}
                  onChange={(e) =>
                    handleInputChange("learningRateMultiplier", e.target.value)
                  }
                />
              </div>

              {/* Tamaño del lote */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="batchSize">Tamaño del lote</Label>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5}>
                        <p className="max-w-xs">
                          El número de ejemplos procesados en cada iteración
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="batchSize"
                  type="number"
                  min="1"
                  value={formData.batchSize}
                  onChange={(e) =>
                    handleInputChange("batchSize", e.target.value)
                  }
                />
              </div>

              {/* Archivo de entrenamiento */}
              <div className="space-y-2">
                <Label htmlFor="trainingFile">Archivo de entrenamiento</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="trainingFile"
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <FileStatusIcon />
                </div>
              </div>

              {/* Botón de crear */}
              <Button
                className="w-full"
                disabled={!isFormValid()}
                onClick={handleSubmit}
              >
                Crear Modelo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Modelo Base</TableHead>
                <TableHead>Tiempo de Entrenamiento</TableHead>
                <TableHead>Ejemplos Optimizados</TableHead>
                <TableHead>Épocas</TableHead>
                <TableHead>Tamaño del Lote</TableHead>
                <TableHead>Tasa de Aprendizaje</TableHead>
                <TableHead>Fecha de Creación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {models.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium">{model.id}</TableCell>
                  <TableCell>{model.baseModel}</TableCell>
                  <TableCell>{model.trainingTime}</TableCell>
                  <TableCell>{model.optimizedExamples}</TableCell>
                  <TableCell>{model.epochs}</TableCell>
                  <TableCell>{model.batchSize}</TableCell>
                  <TableCell>{model.learningRate}</TableCell>
                  <TableCell>
                    {new Date(model.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
