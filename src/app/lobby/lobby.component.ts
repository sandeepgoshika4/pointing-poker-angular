// src/app/lobby/lobby.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RoomApiService } from '../services/room-api.service';
import { v4 as uuidv4 } from 'uuid';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit{
  playerName = '';
  roomCode = '';

  constructor(
    private roomApi: RoomApiService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    // Extract room code from query parameter if shared link is used
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const code = params.get('roomCode');
      if (code) {
        this.roomCode = code;
      }
    });

    const savedName = localStorage.getItem('pp_player_name');
    if (savedName) {
      this.playerName = savedName;
    }
  }


  private ensurePlayerId(): string {
    let id = localStorage.getItem('pp_player_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('pp_player_id', id);
    }
    return id;
  }

  createRoom(): void {
    if (!this.playerName.trim()) return;

    this.roomApi.createRoom().subscribe((room) => {
      const playerId = this.ensurePlayerId();
      localStorage.setItem('pp_player_name', this.playerName.trim());
      this.router.navigate(['/room', room.code], {
        queryParams: { playerId },
      });
    });
  }

  joinRoom(): void {
    if (!this.playerName.trim() || !this.roomCode.trim()) return;

    const playerId = this.ensurePlayerId();
    localStorage.setItem('pp_player_name', this.playerName.trim());

    this.router.navigate(['/room', this.roomCode.trim().toUpperCase()], {
      queryParams: { playerId },
    });
  }
}
