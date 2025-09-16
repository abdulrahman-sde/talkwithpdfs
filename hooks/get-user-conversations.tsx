import useSWRImmutable from "swr/immutable";

interface NavMainItem {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
  items: {
    id: string;
    title: string;
    url: string;
  }[];
}

const fetcher = (...args: [RequestInfo, RequestInit?]) =>
  fetch(...args).then((res) => res.json() as Promise<NavMainItem[]>);

export function useConversations() {
  const { data, error, isLoading, mutate } = useSWRImmutable(
    `/api/conversations`,
    fetcher
  );

  // Function to manually refresh data when needed
  const refreshConversations = () => {
    mutate();
  };

  return {
    data,
    isLoading,
    isError: error,
    refreshConversations, // Export this to manually refresh when new conversation is created
  };
}
