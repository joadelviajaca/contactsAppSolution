import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Observable, of, tap } from 'rxjs';
import { Contact } from '../../shared/interfaces/contacts';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private userId: string = '';
  private urlBase: string = 'http://localhost:3000/api/contactos';

  private contactsSignal = signal<Contact[]>([]);

  constructor(){
    if (this.authService.isLogged()) {
      this.userId = this.authService.userId;
    }
  }

  get contacts() {
    return this.contactsSignal;
  }

  
  getContacts(): void{
    this.userId = this.authService.userId;
    if (this.userId) {
      this.http.get<Contact[]>(`${this.urlBase}/${this.userId}`)
      .subscribe({
        next: contacts => this.contactsSignal.set(contacts),
        error: error => console.log('Error: ', error)
      })
    }
  }

  addContact(contact: Omit<Contact,'id'>): Observable<Contact> {
    return this.http.post<Contact>(`${this.urlBase}`, contact)
    .pipe(
      tap( contact => this.contactsSignal.set([...this.contacts(), contact]))
    )
  }

  removeContact(id: string) {
    return this.http.delete(`${this.urlBase}/${id}`)
    .pipe(
      tap(response => this.contactsSignal.set(this.contacts().filter(contact => contact.id !== id)))
    )
  }

  clearContacts(){
    this.contactsSignal.set([]);
  }

  
}
