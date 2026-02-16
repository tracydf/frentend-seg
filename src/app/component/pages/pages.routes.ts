import { Routes } from '@angular/router';
import { SamplePage1Component } from './sample-page1/sample-page1.component';
import { SamplePage2Component } from './sample-page2/sample-page2.component';
import { DeclarationExportationComponent } from './declaration-exportation/declaration-exportation.component';
import { DeclarationImportationComponent } from './declaration-importation/declaration-importation.component';
import { TransportImportationComponent } from './transport-importation/transport-importation.component';
import { TransportExportationComponent } from './transport-exportation/transport-exportation.component';
import { AssurancesComponent } from './assurances/assurances.component';
import { CertificatOrigineComponent } from './certificat-origine/certificat-origine.component';
import { FacturesComponent } from './factures/factures.component';
import { PaiementsComponent } from './paiements/paiements.component';
import { RapportAmendementComponent } from './rapport-amendement/rapport-amendement.component';
import { RapportAvenantComponent } from './rapport-avenant/rapport-avenant.component';
import { RapportAssuranceComponent } from './rapport-assurance/rapport-assurance.component';
import { RapportCertificatOrigineComponent } from './rapport-certificat-origine/rapport-certificat-origine.component';
import { RapportDeclarationComponent } from './rapport-declaration/rapport-declaration.component';
import { RapportTransportComponent } from './rapport-transport/rapport-transport.component';
import { DocumentationComponent } from './documentation/documentation.component';
import { TicketsComponent } from './tickets/tickets.component';
import { ChatBotComponent } from './chat-bot/chat-bot.component';
import { CarnetAdresseComponent } from './carnet-adresse/carnet-adresse.component';
import { AddDiComponent } from './declaration-importation/add-di/add-di.component';

export const pages: Routes = [
    {
        path: '',
        children: [
          {
            path: 'sample-page1',
            component: SamplePage1Component,
            data: {
              title: "Sample-page1",
              breadcrumb: "Default",
            }
          },
          {
            path: 'sample-page2',
            component: SamplePage2Component,
            data: {
              title: "Sample-page2",
              breadcrumb: "Sample-page2",
            }
          },
          {
            path: 'assurances',
            component: AssurancesComponent,
            data: {
              title: 'Assurances',
              breadcrumb: 'Assurances',
            }
          },
          {
            path: 'importation',
            data: {
              breadcrumb: 'Importations',
            },
            children: [
              {
                path: 'declaration-importation',
                component: DeclarationImportationComponent,
                data: {
                  title: "Déclarations d'importation",
                  breadcrumb: 'Déclarations',
                }
              },
              {
                path: 'declaration-importation/add-di',
                component: AddDiComponent,
                data: {
                  title: "Nouvelle déclaration d'importation",
                  breadcrumb: 'Nouvelle DI',
                }
              },
              {
                path: 'transport-importation',
                component: TransportImportationComponent,
                data: {
                  title: 'Transports en importation',
                  breadcrumb: 'Transports',
                }
              },
              {
                path: 'assurances',
                component: AssurancesComponent,
                data: {
                  title: 'Assurances',
                  breadcrumb: 'Assurances',
                }
              },
            ]
          },
          {
            path: 'exportation',
            data: {
              breadcrumb: 'Exportations',
            },
            children: [
              {
                path: 'declaration-exportation',
                component: DeclarationExportationComponent,
                data: {
                  title: "Déclarations d'exportation",
                  breadcrumb: 'Déclarations',
                }
              },
              {
                path: 'transport-exportation',
                component: TransportExportationComponent,
                data: {
                  title: 'Transports en exportation',
                  breadcrumb: 'Transports',
                }
              },
              {
                path: 'certificat-origine',
                component: CertificatOrigineComponent,
                data: {
                  title: "Certificat d'origine",
                  breadcrumb: "Certificat d'origine",
                }
              },
            ]
          },
          {
            path: 'facturation',
            data: {
              breadcrumb: 'Facturation',
            },
            children: [
              {
                path: 'factures',
                component: FacturesComponent,
                data: {
                  title: 'Factures',
                  breadcrumb: 'Factures',
                }
              },
              {
                path: 'paiements',
                component: PaiementsComponent,
                data: {
                  title: 'Paiements',
                  breadcrumb: 'Paiements',
                }
              },
            ]
          },
          {
            path: 'statistiques',
            data: {
              breadcrumb: 'Statistiques',
            },
            children: [
              {
                path: 'declaration',
                component: RapportDeclarationComponent,
                data: {
                  title: 'Statistique de déclarations',
                  breadcrumb: 'Déclarations',
                }
              },
              {
                path: 'transport',
                component: RapportTransportComponent,
                data: {
                  title: 'Statistique de transports',
                  breadcrumb: 'Transports',
                }
              },
              {
                path: 'assurances',
                component: RapportAssuranceComponent,
                data: {
                  title: 'Statistique d\'assurances',
                  breadcrumb: 'Assurances',
                }
              },
              {
                path: 'certificat-origine',
                component: RapportCertificatOrigineComponent,
                data: {
                  title: 'Statistique de certificat d\'origine',
                  breadcrumb: "Certificat d'origine",
                }
              },
              {
                path: 'amendement',
                component: RapportAmendementComponent,
                data: {
                  title: 'Statistique d\'amendements',
                  breadcrumb: 'Amendements',
                }
              },
              {
                path: 'avenant',
                component: RapportAvenantComponent,
                data: {
                  title: 'Statistique d\'avenants',
                  breadcrumb: 'Avenants',
                }
              },
            ]
          },
          {
            path: 'supports',
            data: {
              breadcrumb: 'Support',
            },
            children: [
              {
                path: 'tickets',
                component: TicketsComponent,
                data: {
                  title: 'Tickets',
                  breadcrumb: 'Tickets',
                }
              },
              {
                path: 'chat-bot',
                component: ChatBotComponent,
                data: {
                  title: 'Chat bot',
                  breadcrumb: 'Chat bot',
                }
              },
            ]
          },
          {
            path: 'documentation',
            component: DocumentationComponent,
            data: {
              title: 'Documentation',
              breadcrumb: 'Documentation',
              parentBreadcrumb: 'Documentation',
              childBreadcrumb: 'Documentation',
            }
          },
          {
            path: 'carnet-adresse',
            component: CarnetAdresseComponent,
            data: {
              title: 'Carnet d\'adresse',
              breadcrumb: 'Carnet d\'adresse',
              parentBreadcrumb: 'Carnet d\'adresse',
              childBreadcrumb: 'Carnet d\'adresse',
            }
          }
        ]
      }
]

