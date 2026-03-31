import { BE_URL, Channel } from "@/types/gallery";
import { useEffect, useState } from "react";

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${BE_URL}/bwl/channels`);
      const json = await res.json();

      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
        ? json.data
        : [];

      setChannels(list.sort((a: Channel, b: Channel) => a.name.localeCompare(b.name)));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  return { channels, loading, refetch: fetchChannels };
};