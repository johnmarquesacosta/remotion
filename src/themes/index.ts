import { channelDefault } from "./channel-default";
import { channelTech } from "./channel-tech";
import { channelHistory } from "./channel-history";
import { channelLifestyle } from "./channel-lifestyle";
import type { ChannelTheme } from "../types/channel.types";

export { channelDefault, channelTech, channelHistory, channelLifestyle };

export const THEMES: Record<string, ChannelTheme> = {
  "channel-default": channelDefault,
  "channel-tech": channelTech,
  "channel-history": channelHistory,
  "channel-lifestyle": channelLifestyle,
};

export function getTheme(channelId: string): ChannelTheme {
  return THEMES[channelId] ?? channelDefault;
}
