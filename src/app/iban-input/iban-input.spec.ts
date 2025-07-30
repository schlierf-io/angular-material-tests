import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { IbanInputComponent } from './iban-input';

describe('IbanInputComponent', () => {
  let component: IbanInputComponent;
  let fixture: ComponentFixture<IbanInputComponent>;
  let inputElement: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        IbanInputComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IbanInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have default input properties', () => {
      expect(component.label).toBe('IBAN');
      expect(component.placeholder).toBe('DE89 3704 0044 0532 0130 00');
      expect(component.required).toBe(false);
      expect(component.disabled).toBe(false);
    });

    it('should initialize form control', () => {
      expect(component.formControl).toBeInstanceOf(FormControl);
      expect(component.formControl.value).toBe('');
    });

    it('should accept custom input properties', () => {
      component.label = 'Custom IBAN';
      component.placeholder = 'Enter IBAN';
      component.required = true;
      component.disabled = true;

      expect(component.label).toBe('Custom IBAN');
      expect(component.placeholder).toBe('Enter IBAN');
      expect(component.required).toBe(true);
      expect(component.disabled).toBe(true);
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should write value and format it', () => {
      const testIban = 'DE89370400440532013000';
      component.writeValue(testIban);

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('should handle null/undefined values in writeValue', () => {
      component.writeValue(null as any);
      expect(component.formControl.value).toBe('');

      component.writeValue(undefined as any);
      expect(component.formControl.value).toBe('');
    });

    it('should register onChange callback', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);

      component.formControl.setValue('DE89 3704 0044 0532 0130 00');

      expect(mockOnChange).toHaveBeenCalledWith('DE89370400440532013000');
    });

    it('should register onTouched callback', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(mockOnTouched);

      component.onBlur();

      expect(mockOnTouched).toHaveBeenCalled();
    });

    it('should set disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      expect(component.formControl.disabled).toBe(true);

      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
      expect(component.formControl.enabled).toBe(true);
    });
  });

  describe('Validator Implementation', () => {
    it('should return null for valid IBAN', () => {
      const control = new FormControl('DE89370400440532013000');
      const result = component.validate(control);

      expect(result).toBeNull();
    });

    it('should return required error when required and empty', () => {
      component.required = true;
      const control = new FormControl('');
      const result = component.validate(control);

      expect(result).toEqual({ required: true });
    });

    it('should return null when not required and empty', () => {
      component.required = false;
      const control = new FormControl('');
      const result = component.validate(control);

      expect(result).toBeNull();
    });

    it('should return invalidIban error for invalid IBAN', () => {
      const control = new FormControl('DE89370400440532013001'); // Invalid checksum
      const result = component.validate(control);

      expect(result).toEqual({ invalidIban: true });
    });

    it('should handle formatted IBAN values in validation', () => {
      const control = new FormControl('DE89 3704 0044 0532 0130 00');
      const result = component.validate(control);

      expect(result).toBeNull();
    });

    it('should validate different invalid IBAN formats', () => {
      const invalidIbans = [
        'FR89370400440532013000', // Wrong country code
        'DE89370400440532013', // Too short
        'DE89370400440532013000123', // Too long
        'DE12345678901234567890', // Invalid checksum
        'DEXX370400440532013000' // Non-numeric check digits
      ];

      invalidIbans.forEach(iban => {
        const control = new FormControl(iban);
        const result = component.validate(control);
        expect(result).toEqual({ invalidIban: true });
      });
    });
  });

  describe('IBAN Formatting (via form control)', () => {
    it('should format IBAN with spaces when typing', () => {
      component.ngOnInit();
      component.formControl.setValue('DE89370400440532013000');

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('should handle empty string', () => {
      component.ngOnInit();
      component.formControl.setValue('');

      expect(component.formControl.value).toBe('');
    });

    it('should convert to uppercase', () => {
      component.ngOnInit();
      component.formControl.setValue('de89370400440532013000');

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('should handle partial IBAN input', () => {
      component.ngOnInit();
      component.formControl.setValue('DE89');

      expect(component.formControl.value).toBe('DE89');
    });

    it('should limit to maximum length', () => {
      component.ngOnInit();
      component.formControl.setValue('DE89370400440532013000123456789');

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });
  });

  describe('Keyboard Input Restrictions', () => {

    it('should allow control keys', () => {
      const controlKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End', 'ArrowLeft', 'ArrowRight'];

      controlKeys.forEach(key => {
        const event = new KeyboardEvent('keydown', { key });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z', () => {
      const allowedKeys = ['a', 'c', 'v', 'x', 'z'];

      allowedKeys.forEach(key => {
        const event = new KeyboardEvent('keydown', { key, ctrlKey: true });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should prevent non-alphanumeric characters', () => {
      const invalidKeys = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '=', '+'];

      invalidKeys.forEach(key => {
        const event = new KeyboardEvent('keydown', { key });
        spyOn(event, 'preventDefault');

        component.onKeyDown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    it('should enforce German IBAN format restrictions', () => {
      // Test first character must be D
      inputElement.value = '';
      inputElement.selectionStart = 0;
      inputElement.selectionEnd = 0;

      const eventF = new KeyboardEvent('keydown', { key: 'F' });
      spyOn(eventF, 'preventDefault');
      Object.defineProperty(eventF, 'target', { value: inputElement });

      component.onKeyDown(eventF);
      expect(eventF.preventDefault).toHaveBeenCalled();

      // Test first character can be D
      const eventD = new KeyboardEvent('keydown', { key: 'D' });
      spyOn(eventD, 'preventDefault');
      Object.defineProperty(eventD, 'target', { value: inputElement });

      component.onKeyDown(eventD);
      expect(eventD.preventDefault).not.toHaveBeenCalled();
    });

    it('should enforce second character must be E', () => {
      inputElement.value = 'D';
      inputElement.selectionStart = 1;
      inputElement.selectionEnd = 1;

      const eventF = new KeyboardEvent('keydown', { key: 'F' });
      spyOn(eventF, 'preventDefault');
      Object.defineProperty(eventF, 'target', { value: inputElement });

      component.onKeyDown(eventF);
      expect(eventF.preventDefault).toHaveBeenCalled();

      // Test second character can be E
      const eventE = new KeyboardEvent('keydown', { key: 'E' });
      spyOn(eventE, 'preventDefault');
      Object.defineProperty(eventE, 'target', { value: inputElement });

      component.onKeyDown(eventE);
      expect(eventE.preventDefault).not.toHaveBeenCalled();
    });

    it('should only allow digits after DE prefix', () => {
      inputElement.value = 'DE';
      inputElement.selectionStart = 2;
      inputElement.selectionEnd = 2;

      const eventA = new KeyboardEvent('keydown', { key: 'A' });
      spyOn(eventA, 'preventDefault');
      Object.defineProperty(eventA, 'target', { value: inputElement });

      component.onKeyDown(eventA);
      expect(eventA.preventDefault).toHaveBeenCalled();

      // Test digits are allowed
      const event8 = new KeyboardEvent('keydown', { key: '8' });
      spyOn(event8, 'preventDefault');
      Object.defineProperty(event8, 'target', { value: inputElement });

      component.onKeyDown(event8);
      expect(event8.preventDefault).not.toHaveBeenCalled();
    });

    it('should prevent input when maximum length is reached', () => {
      inputElement.value = 'DE89 3704 0044 0532 0130 00'; // Full IBAN
      inputElement.selectionStart = inputElement.value.length;
      inputElement.selectionEnd = inputElement.value.length;

      const event = new KeyboardEvent('keydown', { key: '1' });
      spyOn(event, 'preventDefault');
      Object.defineProperty(event, 'target', { value: inputElement });

      component.onKeyDown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow input when text is selected (replacement)', () => {
      inputElement.value = 'DE89 3704 0044 0532 0130 00'; // Full IBAN
      inputElement.selectionStart = 0;
      inputElement.selectionEnd = 5; // Selection exists

      const event = new KeyboardEvent('keydown', { key: '1' });
      spyOn(event, 'preventDefault');
      Object.defineProperty(event, 'target', { value: inputElement });

      component.onKeyDown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      component.formControl.setErrors({ required: true });

      const message = component.getErrorMessage();

      expect(message).toBe('IBAN is required');
    });

    it('should return invalid IBAN error message', () => {
      component.formControl.setErrors({ invalidIban: true });

      const message = component.getErrorMessage();

      expect(message).toBe('Please enter a valid German IBAN');
    });

    it('should return empty string when no errors', () => {
      component.formControl.setErrors(null);

      const message = component.getErrorMessage();

      expect(message).toBe('');
    });

    it('should prioritize required error over invalid IBAN error', () => {
      component.formControl.setErrors({ required: true, invalidIban: true });

      const message = component.getErrorMessage();

      expect(message).toBe('IBAN is required');
    });
  });

  describe('Form Control Value Changes', () => {
    it('should format value on form control changes', () => {
      component.ngOnInit();

      component.formControl.setValue('DE89370400440532013000');

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('should call onChange with unformatted value', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);
      component.ngOnInit();

      component.formControl.setValue('DE89370400440532013000');

      expect(mockOnChange).toHaveBeenCalledWith('DE89370400440532013000');
    });
  });

  describe('Component Lifecycle', () => {
    it('should complete destroy$ subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should work with reactive forms', () => {
      const parentForm = new FormControl('');
      const mockOnChange = jasmine.createSpy('onChange');

      component.registerOnChange(mockOnChange);
      component.writeValue('DE89370400440532013000');

      expect(component.formControl.value).toBe('DE89 3704 0044 0532 0130 00');
    });

    it('should validate and format simultaneously', () => {
      component.required = true;
      const control = new FormControl('DE89370400440532013000');

      const validationResult = component.validate(control);

      expect(validationResult).toBeNull();
    });
  });
});
