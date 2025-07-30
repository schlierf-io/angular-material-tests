import { Component, Input, forwardRef, OnInit, OnDestroy, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-iban-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './iban-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IbanInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => IbanInputComponent),
      multi: true
    }
  ]
})
export class IbanInputComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @Input() label = 'IBAN';
  @Input() placeholder = 'DE89 3704 0044 0532 0130 00';
  @Input() required = false;
  @Input() disabled = false;

  formControl = new FormControl('');
  private destroy$ = new Subject<void>();
  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.formControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const formattedValue = this.formatIban(value || '');
        if (formattedValue !== value) {
          this.formControl.setValue(formattedValue, { emitEvent: false });
        }
        this.onChange(this.getUnformattedIban(formattedValue));
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    const formattedValue = this.formatIban(value || '');
    this.formControl.setValue(formattedValue, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  // Validator implementation
  validate(control: AbstractControl): ValidationErrors | null {
    const value = this.getUnformattedIban(control.value || '');

    if (!value && this.required) {
      return { required: true };
    }

    if (value && !this.isValidGermanIban(value)) {
      return { invalidIban: true };
    }

    return null;
  }

  onBlur() {
    this.onTouched();
  }

  onKeyDown(event: KeyboardEvent) {
    // Allow control keys (backspace, delete, tab, escape, enter, home, end, arrow keys)
    const controlKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
    if (event.ctrlKey || event.metaKey) {
      const allowedCtrlKeys = ['a', 'c', 'v', 'x', 'z'];
      if (allowedCtrlKeys.includes(event.key.toLowerCase())) {
        return; // Allow these combinations
      }
    }

    // Allow control keys
    if (controlKeys.includes(event.key)) {
      return;
    }

    // Get current input value and cursor position
    const input = event.target as HTMLInputElement;
    const currentValue = input.value || '';
    const cursorPosition = input.selectionStart || 0;

    // Remove spaces to get actual IBAN characters
    const unformattedValue = this.getUnformattedIban(currentValue);

    // Block input if we've reached the maximum length (22 characters for German IBAN)
    // Allow if there's a selection (user is replacing text)
    const hasSelection = input.selectionStart !== input.selectionEnd;
    if (unformattedValue.length >= 22 && !hasSelection) {
      event.preventDefault();
      return;
    }

    // Only allow alphanumeric characters
    const isAlphaNumeric = /^[a-zA-Z0-9]$/.test(event.key);

    if (!isAlphaNumeric) {
      event.preventDefault();
      return;
    }

    // For German IBAN, first two characters must be 'DE'
    if (unformattedValue.length === 0 && event.key.toLowerCase() !== 'd') {
      event.preventDefault();
      return;
    }

    if (unformattedValue.length === 1 && event.key.toLowerCase() !== 'e') {
      event.preventDefault();
      return;
    }

    // Characters 3-22 (check digits, bank code, and account number) must be digits only
    if (unformattedValue.length >= 2 && !/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return;
    }
  }

  private formatIban(value: string): string {
    // Remove all non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Add spaces every 4 characters
    const formatted = cleaned.replace(/.{4}/g, '$& ').trim();

    // Limit to German IBAN length (22 characters + spaces)
    return formatted.substring(0, 27); // 22 chars + 5 spaces = 27
  }

  private getUnformattedIban(value: string): string {
    return value.replace(/\s/g, '').toUpperCase();
  }

  private isValidGermanIban(iban: string): boolean {
    // Remove spaces and convert to uppercase
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();

    // Check if it starts with DE and has correct length
    if (!cleanIban.startsWith('DE') || cleanIban.length !== 22) {
      return false;
    }

    // Validate IBAN checksum using mod-97 algorithm
    return this.validateIbanChecksum(cleanIban);
  }

  private validateIbanChecksum(iban: string): boolean {
    // Move first 4 characters to the end
    const rearranged = iban.substring(4) + iban.substring(0, 4);

    // Replace letters with numbers (A=10, B=11, ..., Z=35)
    let numericString = '';
    for (let i = 0; i < rearranged.length; i++) {
      const char = rearranged[i];
      if (char >= 'A' && char <= 'Z') {
        numericString += (char.charCodeAt(0) - 55).toString();
      } else {
        numericString += char;
      }
    }

    // Calculate mod 97
    return this.mod97(numericString) === 1;
  }

  private mod97(numericString: string): number {
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    return remainder;
  }

  getErrorMessage(): string {
    if (this.formControl.hasError('required')) {
      return 'IBAN is required';
    }
    if (this.formControl.hasError('invalidIban')) {
      return 'Please enter a valid German IBAN';
    }
    return '';
  }
}
