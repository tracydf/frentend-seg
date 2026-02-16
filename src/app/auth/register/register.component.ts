import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeathericonComponent } from '../../shared/component/feathericon/feathericon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FeathericonComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  public form: FormGroup;
  public isPhysique = true;

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      // Sélection (deux cases à cocher affichées; on conserve aussi des booléens dans l'état)
      typePhysique: [true],
      typeOrganisme: [false],

      // Commun
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],

      // Personne physique - Informations légales
      pf_nom: [''],
      pf_prenoms: [''],
      pf_niu: [''],

      // Personne physique - Coordonnées
      pf_adresse: [''],
      pf_mobile: [''],
      pf_ville: [''],
      pf_pays: [''],

      // Personne physique - Pièce d'identité (radio: 'cni' | 'passeport')
      pf_piece: [''],

      // Organisme - Informations légales
      org_nom: [''],
      org_raison_social: [''],
      org_niu: [''],
      org_num_chargeur: [''],
      org_num_reg_commerce: [''],
      org_activite: [''],

      // Organisme - Coordonnées
      org_adresse: [''],
      org_ville: [''],
      org_pays: [''],
      org_bp: [''],
      org_mobile: [''],
      org_tel: [''],
      org_fax: [''],
    });

    this.applyValidators();
  }

  selectPhysique(checked: boolean) {
    if (checked) {
      this.isPhysique = true;
      this.form.patchValue({ typePhysique: true, typeOrganisme: false });
      this.applyValidators();
    } else if (!this.form.value['typeOrganisme']) {
      // S'assurer qu'au moins une option reste sélectionnée
      this.isPhysique = true;
      this.form.patchValue({ typePhysique: true });
    }
  }

  selectOrganisme(checked: boolean) {
    if (checked) {
      this.isPhysique = false;
      this.form.patchValue({ typePhysique: false, typeOrganisme: true });
      this.applyValidators();
    } else if (!this.form.value['typePhysique']) {
      this.isPhysique = false;
      this.form.patchValue({ typeOrganisme: true });
    }
  }

  private applyValidators() {
    // Effacer tous les validateurs dynamiques
    const clear = (name: string) => {
      const c = this.form.get(name);
      if (c) { c.clearValidators(); c.updateValueAndValidity({ emitEvent: false }); }
    };
    const require = (name: string, extra: any[] = []) => {
      const c = this.form.get(name);
      if (c) { c.setValidators([Validators.required, ...extra]); c.updateValueAndValidity({ emitEvent: false }); }
    };

    // Les champs communs sont déjà configurés à l'initialisation (email/mot de passe/confirmation)

    // D'abord, nettoyer tous les champs PF/ORG
    [
      'pf_nom','pf_prenoms','pf_niu','pf_adresse','pf_mobile','pf_ville','pf_pays',
      'pf_piece',
      'org_nom','org_raison_social','org_niu','org_num_chargeur','org_num_reg_commerce','org_activite',
      'org_adresse','org_ville','org_pays','org_bp','org_mobile','org_tel','org_fax'
    ].forEach(clear);

    if (this.isPhysique) {
      // Champs requis pour PF
      ['pf_nom','pf_prenoms','pf_niu','pf_adresse','pf_mobile','pf_ville','pf_pays','pf_piece'].forEach(n => require(n));
    } else {
      // Champs requis pour ORG
      ['org_nom','org_raison_social','org_niu','org_num_chargeur','org_num_reg_commerce','org_activite',
       'org_adresse','org_ville','org_pays','org_bp','org_mobile','org_tel']
       .forEach(n => require(n));
    }
  }

  register() {
    // Vérifier que les mots de passe correspondent
    if (this.form.value['password'] !== this.form.value['confirmPassword']) {
      return;
    }

    if (this.form.valid) {
      this.router.navigate(['/auth/login']);
    }
  }
}
