import { useQuery } from "@tanstack/react-query";
import  { getHealth } from "../api";


export const useSystemHealth = () => {
  return useQuery({
    queryKey: ["system-health"],
    queryFn: async () => {
      const { data } = await getHealth()
      console.log(data);
      return data;
    },
    refetchInterval: 5000,
  });
};