import { Component } from '@angular/core';
import { NavmenuService, Menu } from '../../../services/navmenu.service';
import { CommonModule } from '@angular/common';
import { FeathericonComponent } from '../../feathericon/feathericon.component';
import { RouterModule } from '@angular/router';
import { SvgIconComponent } from '../../svg-icon/svg-icon.component';
import { ClickOutsideDirective } from '../../../directives/outside.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [SvgIconComponent, FormsModule, ReactiveFormsModule, CommonModule, RouterModule, ClickOutsideDirective, FeathericonComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  public menuItems: Menu[] = [];
  public item: Menu[] = [];
  public searchResult: boolean = false;
  public searchResultEmpty: boolean = false;
  public text: string = '';
  public open = false

  constructor(public navServices: NavmenuService) {
    this.navServices.item.subscribe((menuItems: Menu[]) =>
      this.item = menuItems
    );
  }

  openMenu() {
    this.open = !this.open
  }

  searchTerm(term: any) {
    term ? this.addFix() : this.removeFix();
    if (!term) return this.menuItems = [];
    let items: Menu[] = [];
    term = term.toLowerCase();
    this.item?.filter(menuItems => {
      if (menuItems.title?.toLowerCase().includes(term) && menuItems.type === 'link') {
        items.push(menuItems);
      }
      menuItems.children?.filter(subItems => {
        if (subItems.title?.toLowerCase().includes(term) && subItems.type === 'link') {
          subItems.icon = menuItems.icon
          items.push(subItems);
        }
        subItems.children?.filter(suSubItems => {
          if (suSubItems.title?.toLowerCase().includes(term)) {
            suSubItems.icon = menuItems.icon
            items.push(suSubItems);
          }
        })
        return
      })
      this.checkSearchResultEmpty(items)
      this.menuItems = items
    })
    return
  }

  checkSearchResultEmpty(items: Menu[]) {
    if (!items.length)
      this.searchResultEmpty = true;
    else
      this.searchResultEmpty = false;
  }

  addFix() {
    this.searchResult = true;
    document.body.classList.add('offcanvas')
  }

  removeFix() {
    this.searchResult = false;
    this.text = "";
    document.body.classList.remove('offcanvas')
  }

  clickOutside(): void {
    this.searchResult = false
    this.searchResultEmpty = false;
    document.body.classList.remove('offcanvas')
  }

}
