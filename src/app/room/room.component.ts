// src/app/room/room.component.ts
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Room } from '../models/room';
import { PokerWebsocketService } from '../services/poker-websocket.service';
import { RoomApiService } from '../services/room-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-room',
    templateUrl: './room.component.html',
    imports: [CommonModule, FormsModule],
    styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
    roomCode!: string;
    playerId!: string;
    playerName!: string;
    room: Room | null = null;
    shareUrl = '';
    navigator = navigator;

    storyTitle = '';
    jiraKey = '';

    deck = ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'];
    subscription!: Subscription;

    constructor(
        private route: ActivatedRoute,
        private ws: PokerWebsocketService,
        private roomApi: RoomApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.roomCode = this.route.snapshot.paramMap.get('code')!;
        if (!this.route.snapshot.queryParamMap.get('playerId')
            && !localStorage.getItem('pp_player_id')) {
            window.location.href = '/lobby';
            return;
        }
        this.playerId =
            this.route.snapshot.queryParamMap.get('playerId') ||
            localStorage.getItem('pp_player_id') ||
            'anon';
        this.playerName =
            localStorage.getItem('pp_player_name') || 'Anonymous';
        this.shareUrl = `${window.location.origin}/room/${this.roomCode}`;

        // Get initial state over REST
        this.roomApi.getRoom(this.roomCode).subscribe((room) => {
            this.room = room;
            this.storyTitle = room.storyTitle || '';
            this.jiraKey = room.jiraKey || '';
            this.cdr.markForCheck();
        });

        this.ws.connect(this.roomCode);
        this.subscription = this.ws.room$.subscribe((room) => {
            if (room) {
                this.room = room;
                this.storyTitle = room.storyTitle || '';
                this.jiraKey = room.jiraKey || '';
                this.cdr.markForCheck();
            }
        });

        // Join room
        // setTimeout(() => {
        //   this.ws.join(this.roomCode, this.playerId, this.playerName);
        // }, 2000);

        this.ws.isConnected.subscribe((connected) => {
            if (connected) {
                this.ws.join(this.roomCode, this.playerId, this.playerName);
            }
        });


    }

    ngOnDestroy(): void {
        this.ws.leave(this.roomCode, this.playerId, this.playerName);
        this.subscription?.unsubscribe();
        this.ws.disconnect();
    }

    vote(card: string): void {
        this.ws.vote(this.roomCode, this.playerId, card);
    }

    reveal(): void {
        this.ws.reveal(this.roomCode, this.playerId);
    }

    hide(): void {
        this.ws.hide(this.roomCode);
    }

    reset(): void {
        this.ws.reset(this.roomCode);
    }

    saveStory(): void {
        this.ws.updateStory(this.roomCode, this.storyTitle, this.jiraKey, this.playerId);
    }

    hasVoted(playerId: string): boolean {
        if (!this.room) return false;
        const player = this.room.players.find((p) => p.id === playerId);
        return !!(player && player.vote);
    }

    // NEW: return the vote for a given player id (or undefined)
    getPlayerVote(playerId: string): string | undefined {
        if (!this.room) return undefined;
        const player = this.room.players.find(p => p.id === playerId);
        return player?.vote || undefined;
    }

    isRoomOwner(room: any): boolean {
        const playerId = localStorage.getItem('pp_player_id');
        return room && room.roomOwnerId === playerId;
    }

}
