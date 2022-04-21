import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayersDashboardComponent } from './players-dashboard.component';

describe('PlayersDashboardComponent', () => {
  let component: PlayersDashboardComponent;
  let fixture: ComponentFixture<PlayersDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlayersDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayersDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
