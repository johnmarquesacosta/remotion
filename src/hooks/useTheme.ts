import { getTheme } from "../themes";
import type { ChannelTheme } from "../types/channel.types";

// O channelId deve ser passado via props da composição
export function useTheme(channelId: string): ChannelTheme {
  return getTheme(channelId);
}
