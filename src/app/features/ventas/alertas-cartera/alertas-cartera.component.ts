import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { VentasService } from '../../../core/services/ventas.service';
import { FechaCoPipe, MonedaCoPipe } from '../../../shared/pipes/locale.pipes';

@Component({
  selector: 'app-alertas-cartera',
  standalone: true,
  imports: [
    MatCardModule, MatTableModule, MatChipsModule, MatButtonModule, MatIconModule,
    RouterLink, PageHeaderComponent, FechaCoPipe, MonedaCoPipe,
  ],
  template: `
    <app-page-header
      title="Alertas de cartera"
      subtitle="Facturas próximas a vencer o vencidas"
      icon="notifications_active"
    />

    @if (alertas().length === 0) {
      <mat-card class="empty">
        <mat-icon>check_circle</mat-icon>
        <p>No hay alertas de vencimiento en este momento.</p>
      </mat-card>
    } @else {
      <mat-card>
        <table mat-table [dataSource]="alertas()" class="full-width">
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef>Tipo</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip-set>
                <mat-chip [highlighted]="true" [color]="row.tipo === 'vencida' ? 'warn' : 'accent'">
                  {{ row.tipo === 'vencida' ? 'Vencida' : 'Próxima a vencer' }}
                </mat-chip>
              </mat-chip-set>
            </td>
          </ng-container>
          <ng-container matColumnDef="cliente">
            <th mat-header-cell *matHeaderCellDef>Cliente</th>
            <td mat-cell *matCellDef="let row">{{ row.clienteNombre }}</td>
          </ng-container>
          <ng-container matColumnDef="factura">
            <th mat-header-cell *matHeaderCellDef>Factura</th>
            <td mat-cell *matCellDef="let row">{{ row.numeroFactura }}</td>
          </ng-container>
          <ng-container matColumnDef="vencimiento">
            <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
            <td mat-cell *matCellDef="let row">{{ row.fechaVencimiento | fechaCo }}</td>
          </ng-container>
          <ng-container matColumnDef="dias">
            <th mat-header-cell *matHeaderCellDef>Días</th>
            <td mat-cell *matCellDef="let row">
              @if (row.diasRestantes < 0) {
                {{ -row.diasRestantes }} días vencida
              } @else {
                {{ row.diasRestantes }} días restantes
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="saldo">
            <th mat-header-cell *matHeaderCellDef>Saldo</th>
            <td mat-cell *matCellDef="let row">{{ row.saldoPendiente | monedaCo }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
        <div class="footer">
          <a mat-stroked-button routerLink="/ventas/cartera">
            <mat-icon>payments</mat-icon> Ir a cartera
          </a>
        </div>
      </mat-card>
    }
  `,
  styles: `
    .full-width { width: 100%; }
    .empty { text-align: center; padding: 48px; color: #78909c; }
    .empty mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px; color: #66bb6a; }
    .footer { padding: 16px 24px; border-top: 1px solid #eceff1; }
  `,
})
export class AlertasCarteraComponent {
  private readonly ventas = inject(VentasService);

  readonly alertas = computed(() => {
    this.ventas.version();
    return this.ventas.getAlertasCartera();
  });

  readonly columns = ['tipo', 'cliente', 'factura', 'vencimiento', 'dias', 'saldo'];
}
