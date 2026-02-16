import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  sliderImages: string[] = [
    'assets/images/slider/1.jpg',
    'assets/images/slider/2.jpg',
    'assets/images/slider/3.jpg',
    'assets/images/slider/4.jpg',
    'assets/images/slider/5.jpg',
    'assets/images/slider/6.jpg',
    'assets/images/slider/7.jpg',
    'assets/images/slider/8.jpg',
    'assets/images/slider/9.jpg',
    'assets/images/slider/10.jpg',
    'assets/images/slider/11.jpg',
  ];
  currentIndex = 0;
  private intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.sliderImages.length;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
