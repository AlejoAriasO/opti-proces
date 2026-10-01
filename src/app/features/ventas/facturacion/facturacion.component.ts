import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { FechaCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatChipsModule, PageHeaderComponent, FechaCoPipe, MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Facturación"
      subtitle="Asocie manualmente el número de factura emitido en el software externo"
      icon="receipt"
    />

    <mat-card class="form-card">
      <h3>Registrar factura</h3>
      <form [formGroup]="form" (ngSubmit)="registrar()">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Pedido</mat-label>
          <mat-select formControlName="pedidoId">
            @for (p of pedidosSinFactura(); track p.id) {
              <mat-option [value]="p.id">
                #{{ p.id.slice(0, 8) }} — {{ nombreCliente(p.clienteId) }} ({{ ventas.getValorPedido(p) | monedaCo }})
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
        <div class="row">
          <mat-form-field appearance="outline">
            <mat-label>Número de factura</mat-label>
            <input matInput formControlName="numeroFactura" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha de factura</mat-label>
            <input matInput [matDatepicker]="pickerFactura" formControlName="fechaFactura" />
            <mat-datepicker-toggle matIconSuffix [for]="pickerFactura" />
            <mat-datepicker #pickerFactura />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha de vencimiento</mat-label>
            <input matInput [matDatepicker]="pickerVenc" formControlName="fechaVencimiento" />
            <mat-datepicker-toggle matIconSuffix [for]="pickerVenc" />
            <mat-datepicker #pickerVenc />
          </mat-form-field>
        </div>
        <div class="actions">
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || pedidosSinFactura().length === 0">
            Registrar factura y cartera
          </button>
        </div>
      </form>
    </mat-card>

    <mat-card class="list-card">
      <h3>Facturas registradas</h3>
      @for (f of facturas(); track f.id) {
        <div class="factura-row">
          <div>
            <strong>Factura {{ f.numeroFactura }}</strong>
            <span>Pedido #{{ f.pedidoId.slice(0, 8) }} — {{ nombreCliente(pedidoCliente(f.pedidoId)) }}</span>
            <span>Fecha: {{ f.fechaFactura | fechaCo }}</span>
          </div>
          <mat-chip-set>
            <mat-chip highlighted color="primary">Registrada</mat-chip>
          </mat-chip-set>
        </div>
      }
      @if (facturas().length === 0) {
        <p class="empty">No hay facturas registradas.</p>
      }
    </mat-card>
  `,
  styles: `
    .form-card, .list-card { padding: 24px; margin-bottom: 24px; }
    h3 { margin: 0 0 16px; color: #37474f; }
    .full-width { width: 100%; }
    .row { display: flex; gap: 16px; flex-wrap: wrap; }
    .actions { margin-top: 16px; }
    .factura-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eceff1; }
    .factura-row div { display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; color: #546e7a; }
    .empty { text-align: center; color: #78909c; padding: 24px; }
  `,
})
export class FacturacionComponent {
  readonly ventas = inject(VentasService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly refresh = signal(0);

  readonly form = this.fb.group({
    pedidoId: ['', Validators.required],
    numeroFactura: ['', Validators.required],
    fechaFactura: [new Date(), Validators.required],
    fechaVencimiento: [new Date(), Validators.required],
  });

  readonly pedidosSinFactura = computed(() => {
    this.refresh();
    this.ventas.version();
    return this.ventas.getPedidos().filter(
      (p) => !this.ventas.pedidoEstaFacturado(p.id) && p.estado !== 'cancelado'
    );
  });

  readonly facturas = computed(() => {
    this.refresh();
    this.ventas.version();
    return this.ventas.getFacturas();
  });

  registrar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const result = this.ventas.registrarFactura({
      pedidoId: v.pedidoId!,
      numeroFactura: v.numeroFactura!,
      fechaFactura: (v.fechaFactura as Date).toISOString(),
      fechaVencimiento: (v.fechaVencimiento as Date).toISOString(),
    });
    if (!result.ok) {
      this.snackBar.open(result.error ?? 'Error', 'Cerrar', { duration: 5000 });
      return;
    }
    this.snackBar.open('Factura y cartera registradas.', 'Cerrar', { duration: 4000 });
    this.form.reset({ fechaFactura: new Date(), fechaVencimiento: new Date() });
    this.refresh.update((n) => n + 1);
  }

  nombreCliente(id: string): string {
    return this.ventas.getClienteById(id)?.nombre ?? '—';
  }

  pedidoCliente(pedidoId: string): string {
    return this.ventas.getPedidoById(pedidoId)?.clienteId ?? '';
  }
}
