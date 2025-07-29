import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { IbanInputComponent } from '../iban-input/iban-input';

interface Country {
  name: string;
  code: string;
}

@Component({
  selector: 'app-sample-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatSnackBarModule,
    NgxMaskDirective,
    IbanInputComponent
  ],
  templateUrl: './sample-form.html',
  styleUrls: ['./sample-form.css']
})
export class SampleFormComponent {
  sampleForm: FormGroup;
  hidePassword = true;
  
  countries: Country[] = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'UK' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Japan', code: 'JP' },
    { name: 'Australia', code: 'AU' }
  ];

  hobbies = [
    { name: 'Reading', checked: false },
    { name: 'Gaming', checked: false },
    { name: 'Sports', checked: false },
    { name: 'Music', checked: false },
    { name: 'Travel', checked: false }
  ];

  ibanPatterns = {
    'A': { pattern: new RegExp('[A-Z]') },
    '0': { pattern: new RegExp('[0-9]') }
  };

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.sampleForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      dateOfBirth: ['', Validators.required],
      country: ['', Validators.required],
      gender: ['', Validators.required],
      bio: ['', [Validators.maxLength(500)]],
      newsletter: [false],
      terms: [false, Validators.requiredTrue],
      rating: [3],
      salary: [50000, [Validators.min(0), Validators.max(1000000)]],
      iban: ['', Validators.required],
      ibanMask: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.sampleForm.valid) {
      const formData = {
        ...this.sampleForm.value,
        hobbies: this.hobbies.filter(h => h.checked).map(h => h.name)
      };
      
      console.log('Form Data:', formData);
      this.snackBar.open('Form submitted successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open('Please fill in all required fields correctly.', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.markFormGroupTouched();
    }
  }

  onReset() {
    this.sampleForm.reset();
    this.hobbies.forEach(hobby => hobby.checked = false);
    this.sampleForm.patchValue({
      rating: 3,
      salary: 50000
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.sampleForm.controls).forEach(key => {
      const control = this.sampleForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.sampleForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${fieldName} must be no more than ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid format';
    }
    if (control?.hasError('min')) {
      return `Value must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `Value must be no more than ${control.errors?.['max'].max}`;
    }
    return '';
  }
}
