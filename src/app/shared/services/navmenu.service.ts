import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface Menu {
  headTitle1?: string;
  level?: number;
  path?: string;
  title?: string;
  icon?: string;
  type?: string;
  active?: boolean;
  id?: number;
  bookmark?: boolean;
  children?: Menu[];
  horizontalList?: boolean;
  items?: Menu[]
}


@Injectable({
  providedIn: 'root'
})
export class NavmenuService {

  public isDisplay!: boolean;
  public language: boolean = false;
  public isShow: boolean = false;
  public closeSidebar: boolean = false;


  constructor() { }

  MENUITEMS: Menu[] = [
    {
      headTitle1: "Général",
    },
    { level: 1, id:1,  path: '/dashboard',  title: "Tableaux de bord", icon: "home", active: false, type: "link" },
    {
      headTitle1: "Applications",
    },
    {
      id: 2,
      level: 1,
      title: "Importations",
      icon: "others",
      type: "sub",
      active: true,
      children: [
				{ path: '/pages/importation/declaration-importation', title: 'Déclarations', type: 'link' },
        { path: '/pages/importation/transport-importation', title: 'Transports', type: 'link' },
        { path: '/pages/importation/assurances', title: 'Assurances', type: 'link' },
      ],
    },
  
    //{ level: 1, id:2,  path: '/sample-page',  title: "Assurance", icon: "support-tickets", active: false, type: "link" },

    {
      id: 3,
      level: 1,
      title: "Exportations",
      icon: "form",
      type: "sub",
      active: false,
      children: [
        { path: '/pages/exportation/declaration-exportation', title: 'Déclarations', type: 'link' },
        { path: '/pages/exportation/transport-exportation', title: 'Transports', type: 'link' },
        { path: "/pages/exportation/certificat-origine", title: "Certificat d'origine", type: 'link' },
      ],
    },

    {
      headTitle1: "Services",
    },
    {
      id: 4,
      level: 1,
      title: "Facturation",
      icon: "bonus-kit",
      type: "sub",
      active: false,
      children: [
        { path: '/pages/facturation/factures', title: 'Factures', type: 'link' },
        { path: '/pages/facturation/paiements', title: 'Paiements', type: 'link' },
      ],
    },
    {
      id: 5,
      level: 1,
      title: "Statistiques",
      icon: "charts",
      type: "sub",
      active: false,
      children: [
        { path: '/pages/statistiques/declaration', title: 'Déclarations', type: 'link' },
        { path: '/pages/statistiques/transport', title: 'Transports', type: 'link' },
        { path: '/pages/statistiques/assurances', title: 'Assurances', type: 'link' },
        { path: '/pages/statistiques/certificat-origine', title: 'Certificat d\'origine', type: 'link' },
        { path: '/pages/statistiques/amendement', title: 'Amendements', type: 'link' },
        { path: '/pages/statistiques/avenant', title: 'Avenants', type: 'link' },
      ],
    },
    {
      id: 6,
      level: 1,
      title: "Support",
      icon: "support-tickets",
      type: "sub",
      active: false,
      children: [
        { path: '/pages/supports/tickets', title: 'Tickets', type: 'link' },
        { path: '/pages/supports/chat-bot', title: 'Chat bot', type: 'link' },
      ],
    },
    { level: 1, id:7,  path: '/pages/carnet-adresse',  title: "Carnet d'adresse", icon: "table", active: false, type: "link" },
    { level: 1, id:8,  path: '/pages/documentation',  title: "Documentation", icon: "file", active: false, type: "link" },
  ]

  item = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
