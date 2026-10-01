import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Cliente } from '../../../core/models';
import { VentasService } from '../../../core/services/ventas.service';

@Component({
  selector: 'app-cliente-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar' : 'Nuevo' }} cliente</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="telefono" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo</mat-label>
          <input matInput type="email" formControlName="correo" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="direccion" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Ciudad</mat-label>
          <input matInput formControlName="ciudad" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observaciones" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="form.invalid">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: `.form { min-width: 320px; padding-top: 8px; } .full-width { width: 100%; }`,
})
export class ClienteFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ventas = inject(VentasService);
  private readonly dialogRef = inject(MatDialogRef<ClienteFormDialogComponent>);
  readonly data = inject<Cliente | null>(MAT_DIALOG_DATA);
  readonly esEdicion = !!this.data;

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.nombre ?? '', Validators.required],
    telefono: [this.data?.telefono ?? ''],
    correo: [this.data?.correo ?? ''],
    direccion: [this.data?.direccion ?? ''],
    ciudad: [this.data?.ciudad ?? ''],
    observaciones: [this.data?.observaciones ?? ''],
  });

  guardar(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    if (this.esEdicion && this.data) {
      this.ventas.actualizarCliente(this.data.id, v);
    } else {
      this.ventas.crearCliente(v);
    }
    this.dialogRef.close(true);
  }
}
