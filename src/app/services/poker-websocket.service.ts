// src/app/services/poker-websocket.service.ts
import { Injectable } from '@angular/core';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { Room } from '../models/room';

@Injectable({ providedIn: 'root' })
export class PokerWebsocketService {
  private client: Client | null = null;
  private roomSubject = new BehaviorSubject<Room | null>(null);
  room$: Observable<Room | null> = this.roomSubject.asObservable();
  isConnected = new BehaviorSubject<boolean>(false);

  private currentRoomCode: string | null = null;

  connect(roomCode: string): void {
    this.currentRoomCode = roomCode;

    if (this.client && this.client.connected) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () =>
        new SockJS('/ws'),
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      if (!this.client || !this.currentRoomCode) return;
      console.log('WebSocket connected');
      this.client.subscribe(
        `/topic/rooms/${this.currentRoomCode}`,
        (message: IMessage) => {
          console.log('WebSocket message received:', message.body);
          const room: Room = JSON.parse(message.body);
          this.roomSubject.next(room);
        }
      );
      this.isConnected.next(true);
    };

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.client = null;
    this.currentRoomCode = null;
  }

  private send(destination: string, body: any): void {
    if (!this.client || !this.client.connected) {
      console.warn('STOMP not connected');
      return;
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  join(roomCode: string, playerId: string, name: string): void {
    this.send(`/app/rooms/${roomCode}/join`, { playerId, name });
  }

  leave(roomCode: string, playerId: string, name: string): void {
    this.send(`/app/rooms/${roomCode}/leave`, { playerId, name });
  }

  vote(roomCode: string, playerId: string, value: string): void {
    this.send(`/app/rooms/${roomCode}/vote`, { playerId, value });
  }

  reveal(roomCode: string, playerId: string): void {
    this.send(`/app/rooms/${roomCode}/reveal`, {playerId});
  }

  hide(roomCode: string): void {
    this.send(`/app/rooms/${roomCode}/hide`, {});
  }

  reset(roomCode: string): void {
    this.send(`/app/rooms/${roomCode}/reset`, {});
  }

  updateStory(roomCode: string, storyTitle: string, jiraKey: string, playerId: string): void {
    this.send(`/app/rooms/${roomCode}/story`, { storyTitle, jiraKey, playerId });
  }
}
