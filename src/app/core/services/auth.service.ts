import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SesionUsuario, Usuario } from '../models';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  get sesion(): SesionUsuario | null {
    return this.storage.getSession();
  }

  get isAuthenticated(): boolean {
    return !!this.sesion;
  }

  login(correo: string, password: string): { ok: boolean; error?: string } {
    const data = this.storage.load();
    const user = data.usuarios.find(
      (u) => u.correo.toLowerCase() === correo.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      return { ok: false, error: 'Correo o contraseña incorrectos' };
    }

    this.storage.setSession(user);
    return { ok: true };
  }

  logout(): void {
    this.storage.clearSession();
    this.router.navigate(['/login']);
  }

  getUsuarios(): Usuario[] {
    return this.storage.load().usuarios;
  }
}
