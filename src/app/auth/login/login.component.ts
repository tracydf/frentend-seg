import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FeathericonComponent } from '../../shared/component/feathericon/feathericon.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,RouterModule, FeathericonComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  public show: boolean = false;
  public loginForm: FormGroup;

  constructor(private fb: FormBuilder, public router: Router) {

    const userData = localStorage.getItem('user');
    if (userData) {
      const current = this.router.url;
      const onAuthRoute = current.startsWith('/auth/');
      if (!onAuthRoute) {
        this.router.navigate(['/dashboard']);
      }
    }

    this.loginForm = this.fb.group({
      email: ["Test@gmail.com", [Validators.required, Validators.email]],
      password: ["test123", Validators.required],
    });

  }
  showPassword() {
    this.show = !this.show;
  }

  // Connexion simple
  login() {
    if (this.loginForm.value["email"] == "Test@gmail.com" && this.loginForm.value["password"] == "test123") {
      let user = {
        email: "Test@gmail.com",
        password: "test123",
        name: "test user",
      };

      localStorage.setItem("user", JSON.stringify(user));
      this.router.navigate(["/dashboard"]);
    }
  }


}
