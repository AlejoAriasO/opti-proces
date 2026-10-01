import { Injectable, inject, signal } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { AppData, SESSION_KEY, STORAGE_KEY, Usuario } from '../models';
import { environment, isFirebaseConfigured } from '../../../environments/environment';

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

export type CloudStatus = 'sin-configurar' | 'conectando' | 'cloud' | 'local' | 'error';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly firestore = inject(Firestore, { optional: true });
  private cache: AppData | null = null;
  private persistQueue: Promise<void> = Promise.resolve();

  readonly cloudStatus = signal<CloudStatus>(
    isFirebaseConfigured() ? 'conectando' : 'sin-configurar'
  );
  readonly cloudError = signal<string | null>(null);

  async initFromCloud(): Promise<void> {
    if (!isFirebaseConfigured() || !this.firestore) {
      this.loadFromLocal();
      this.cloudStatus.set('sin-configurar');
      return;
    }

    try {
      const snapshot = await getDoc(this.appDoc());
      const local = this.readLocalRaw();

      if (snapshot.exists()) {
        const cloud = this.mergeWithDefaults(snapshot.data() as Partial<AppData>);
        const cloudVacio = !this.hasBusinessData(cloud);
        const localConDatos = !!local && this.hasBusinessData(local);

        this.cache = cloudVacio && localConDatos ? local : cloud;
        this.writeLocal();
        if (cloudVacio && localConDatos) {
          await this.writeCloud();
        }
        this.cloudStatus.set('cloud');
        this.cloudError.set(null);
        return;
      }

      this.cache = local ?? structuredClone(DEFAULT_DATA);
      this.writeLocal();
      await this.writeCloud();
      this.cloudStatus.set('cloud');
      this.cloudError.set(null);
    } catch (error) {
      this.loadFromLocal();
      this.cloudStatus.set('error');
      this.cloudError.set(
        error instanceof Error ? error.message : 'No se pudo conectar con Firestore'
      );
      console.error('[Firestore] Error al iniciar:', error);
    }
  }

  load(): AppData {
    if (this.cache) {
      return this.cache;
    }

    this.loadFromLocal();
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

  get projectId(): string {
    return environment.firebase.projectId;
  }

  private appDoc() {
    return doc(this.firestore!, 'opti-proces', 'app-data');
  }

  private loadFromLocal(): void {
    this.cache = this.readLocalRaw() ?? structuredClone(DEFAULT_DATA);
    this.writeLocal();
    if (this.cloudStatus() === 'conectando') {
      this.cloudStatus.set('local');
    }
  }

  private readLocalRaw(): AppData | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return this.mergeWithDefaults(JSON.parse(raw) as Partial<AppData>);
    } catch {
      return null;
    }
  }

  private mergeWithDefaults(partial: Partial<AppData>): AppData {
    return { ...structuredClone(DEFAULT_DATA), ...partial };
  }

  private hasBusinessData(data: AppData): boolean {
    return (
      data.materiasPrimas.length > 0 ||
      data.productosTerminados.length > 0 ||
      data.proveedores.length > 0 ||
      data.clientes.length > 0 ||
      data.pedidos.length > 0 ||
      data.compras.length > 0 ||
      data.ordenesCompra.length > 0
    );
  }

  private persist(): void {
    this.writeLocal();
    if (!isFirebaseConfigured() || !this.firestore) {
      return;
    }

    this.persistQueue = this.persistQueue
      .then(() => this.writeCloud())
      .then(() => {
        this.cloudStatus.set('cloud');
        this.cloudError.set(null);
      })
      .catch((error) => {
        this.cloudStatus.set('error');
        this.cloudError.set(
          error instanceof Error ? error.message : 'No se pudo guardar en Firestore'
        );
        console.error('[Firestore] Error al guardar:', error);
      });
  }

  private writeLocal(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
  }

  private async writeCloud(): Promise<void> {
    if (!this.firestore || !this.cache) return;
    const payload = JSON.parse(JSON.stringify(this.cache)) as AppData;
    await setDoc(this.appDoc(), payload);
  }
}
