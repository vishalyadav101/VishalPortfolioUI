import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ContactService } from '../../../core/services/contact';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  readonly isSubmitting = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],

    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],

    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
  });

  get name() {
    return this.contactForm.controls.name;
  }

  get email() {
    return this.contactForm.controls.email;
  }

  get subject() {
    return this.contactForm.controls.subject;
  }

  get message() {
    return this.contactForm.controls.message;
  }

  onSubmit(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.contactService.createContact(this.contactForm.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);

        this.successMessage.set(
          'Your message has been sent successfully. Thank you for contacting me!',
        );

        this.contactForm.reset({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
      },

      error: (error) => {
        console.error('Contact Submit Error:', error);

        this.isSubmitting.set(false);

        this.errorMessage.set(
          error?.error?.message || 'Unable to send your message. Please try again later.',
        );
      },
    });
  }
}
