import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit, Play, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { WorkoutRoutine } from "@shared/schema";

const routineFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  exercises: z.array(z.string()).min(1, "At least one exercise is required"),
});

type RoutineFormData = z.infer<typeof routineFormSchema>;

export default function Routines() {
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [exerciseInput, setExerciseInput] = useState("");
  const { toast } = useToast();

  const { data: routines } = useQuery<WorkoutRoutine[]>({
    queryKey: ["/api/routines"],
  });

  const form = useForm<RoutineFormData>({
    resolver: zodResolver(routineFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      exercises: [],
    },
  });

  const createRoutineMutation = useMutation({
    mutationFn: async (data: RoutineFormData) => {
      const response = await apiRequest("POST", "/api/routines", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Success", description: "Routine created successfully!" });
      setIsAddingRoutine(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create routine", variant: "destructive" });
    },
  });

  const updateRoutineMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoutineFormData }) => {
      const response = await apiRequest("PUT", `/api/routines/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Success", description: "Routine updated successfully!" });
      setEditingRoutine(null);
      form.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update routine", variant: "destructive" });
    },
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/routines/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routines"] });
      toast({ title: "Success", description: "Routine deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete routine", variant: "destructive" });
    },
  });

  const onSubmit = (data: RoutineFormData) => {
    if (editingRoutine) {
      updateRoutineMutation.mutate({ id: editingRoutine.id, data });
    } else {
      createRoutineMutation.mutate(data);
    }
  };

  const addExercise = () => {
    if (exerciseInput.trim()) {
      const currentExercises = form.getValues("exercises");
      form.setValue("exercises", [...currentExercises, exerciseInput.trim()]);
      setExerciseInput("");
    }
  };

  const removeExercise = (index: number) => {
    const currentExercises = form.getValues("exercises");
    form.setValue("exercises", currentExercises.filter((_, i) => i !== index));
  };

  const startEdit = (routine: WorkoutRoutine) => {
    setEditingRoutine(routine);
    form.reset({
      name: routine.name,
      description: routine.description || "",
      duration: routine.duration || 30,
      exercises: routine.exercises || [],
    });
    setIsAddingRoutine(true);
  };

  const cancelEdit = () => {
    setEditingRoutine(null);
    setIsAddingRoutine(false);
    form.reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zen-dark dark:text-white">My Routines</h2>
        <Button 
          onClick={() => setIsAddingRoutine(true)}
          className="bg-zen-blue text-white px-4 py-2 rounded-xl font-medium hover:bg-zen-blue/90"
        >
          <Plus className="mr-2" size={16} />
          Add New
        </Button>
      </div>

      {/* Add/Edit Routine Dialog */}
      <Dialog open={isAddingRoutine} onOpenChange={setIsAddingRoutine}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoutine ? "Edit Routine" : "Add New Routine"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter routine name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter routine description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel>Exercises</FormLabel>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add an exercise"
                    value={exerciseInput}
                    onChange={(e) => setExerciseInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExercise())}
                  />
                  <Button type="button" onClick={addExercise}>Add</Button>
                </div>
                <div className="space-y-2">
                  {form.watch("exercises").map((exercise, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm">{exercise}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExercise(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createRoutineMutation.isPending || updateRoutineMutation.isPending}
                >
                  {editingRoutine ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Routines List */}
      {routines?.map((routine) => (
        <Card key={routine.id} className="bg-white dark:bg-zen-gray rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-zen-dark dark:text-white">{routine.name}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <Clock className="mr-1" size={12} />
                {routine.duration} min
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEdit(routine)}
                className="text-zen-blue hover:text-zen-green"
              >
                <Edit size={16} />
              </Button>
            </div>
          </div>
          
          {routine.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{routine.description}</p>
          )}
          
          <div className="space-y-3">
            {routine.exercises?.map((exercise, index) => (
              <div key={index} className="flex items-center">
                <Checkbox className="w-5 h-5 text-zen-blue rounded mr-3" />
                <span className="text-zen-dark dark:text-white">{exercise}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {routine.exercises?.length || 0} exercises
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-zen-green text-white hover:bg-zen-green/90"
              >
                <Play className="mr-1" size={14} />
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteRoutineMutation.mutate(routine.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <Link href="/">
        <Button className="w-full bg-gray-200 dark:bg-zen-dark-mode text-zen-dark dark:text-white font-medium py-3 px-6 rounded-xl">
          <ArrowLeft className="mr-2" size={16} />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
