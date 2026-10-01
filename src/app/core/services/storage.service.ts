import { Injectable } from '@angular/core';
import { AppData, SESSION_KEY, STORAGE_KEY, Usuario } from '../models';

const DEFAULT_DATA: AppData = {
  materiasPrimas: [],
  productosTerminados: [],
  recetas: [],
  compras: [],
  movimientos: [],
  proveedores: [],
  ordenesCompra: [],
  clientes: [],
  pedidos: [],
  consolidadosProduccion: [],
  facturas: [],
  cartera: [],
  usuarios: [
    {
      id: '1',
      nombre: 'Administrador',
      correo: 'admin@opti-proces.local',
      password: 'admin123',
    },
  ],
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  private cache: AppData | null = null;

  load(): AppData {
    if (this.cache) {
      return this.cache;
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.cache = structuredClone(DEFAULT_DATA);
      this.persist();
      return this.cache;
    }

    try {
      this.cache = { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) };
    } catch {
      this.cache = structuredClone(DEFAULT_DATA);
      this.persist();
    }

    return this.cache!;
  }

  save(data: AppData): void {
    this.cache = data;
    this.persist();
  }

  update(mutator: (data: AppData) => void): AppData {
    const data = structuredClone(this.load());
    mutator(data);
    this.save(data);
    return data;
  }

  reset(): void {
    this.cache = structuredClone(DEFAULT_DATA);
    this.persist();
  }

  getSession(): { id: string; nombre: string; correo: string } | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  setSession(user: Usuario): void {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: user.id, nombre: user.nombre, correo: user.correo })
    );
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
  }
}
