import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
    getUserPudoPoint,
    saveUserPudoPoint,
    deleteUserPudoPoint,
    type CorreosPudoPoint,
} from "@/lib/pudoService";

export function useUserPudoPoint() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["user-pudo-point", user?.id],
        queryFn: async () => {
            if (!user) return null;
            return getUserPudoPoint(user.id);
        },
        enabled: !!user,
    });
}

export function useSavePudoPoint() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (pudoData: Partial<CorreosPudoPoint>) => {
            if (!user) throw new Error("User not authenticated");
            await saveUserPudoPoint(user.id, pudoData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-pudo-point", user?.id] });
        },
    });
}

export function useDeletePudoPoint() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error("User not authenticated");
            await deleteUserPudoPoint(user.id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-pudo-point", user?.id] });
        },
    });
}
