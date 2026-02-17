import { useQuery } from "@tanstack/react-query";
import { getDatasets } from "@/lib/api";

export function useDatasets() {
  return useQuery({
    queryKey: ["datasets"],
    queryFn: getDatasets,
  });
}
