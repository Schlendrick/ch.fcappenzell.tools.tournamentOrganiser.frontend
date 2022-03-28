import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailImporterComponent } from './mail-importer.component';

describe('MailImporterComponent', () => {
  let component: MailImporterComponent;
  let fixture: ComponentFixture<MailImporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailImporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
