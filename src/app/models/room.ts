import { Player } from "./player";

export interface Room {
  code: string;
  storyTitle?: string;
  jiraKey?: string;
  revealed: boolean;
  roomOwnerId: string;
  roomOwnerName: string;
  players: Player[];
}