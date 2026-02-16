import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent {
  form: FormGroup;
  dragOver = false;
  selectedFile?: File | null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      typeEntite: ['', Validators.required],
      entite: ['', Validators.required],
      objet: ['', Validators.required],
      description: [''],
      fichier: [null, Validators.required]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.setFile(input.files[0]);
      // reset the input so selecting the same file again will trigger change
      input.value = '';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      this.setFile(files[0]);
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.form.patchValue({ fichier: null });
    this.form.get('fichier')?.updateValueAndValidity();
  }

  private setFile(file: File) {
    this.selectedFile = file;
    this.form.patchValue({ fichier: file });
    this.form.get('fichier')?.updateValueAndValidity();
  }

  get selectedFileSize(): string {
    const f = this.selectedFile;
    if (!f) return '';
    const bytes = f.size;
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }
}
