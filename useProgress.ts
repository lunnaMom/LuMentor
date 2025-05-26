import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserProgress } from "@shared/schema";

export function useProgress() {
  return useQuery<UserProgress>({
    queryKey: ["/api/progress"],
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<UserProgress>) => {
      const res = await apiRequest("PATCH", "/api/progress", updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });
}

export function useModules() {
  return useQuery({
    queryKey: ["/api/modules"],
  });
}

export function useLesson(moduleId: number, lessonId: number) {
  return useQuery({
    queryKey: [`/api/modules/${moduleId}/lessons/${lessonId}`],
    enabled: moduleId > 0 && lessonId > 0,
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      moduleId, 
      lessonId, 
      answers 
    }: { 
      moduleId: number; 
      lessonId: number; 
      answers: number[] 
    }) => {
      const res = await apiRequest(
        "POST", 
        `/api/modules/${moduleId}/lessons/${lessonId}/quiz`, 
        { answers }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });
}
