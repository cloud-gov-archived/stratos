import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { createBasicStoreModule } from '@stratosui/store/testing';

import { CoreTestingModule } from '../../../../test-framework/core-test.modules';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';
import { ConnectEndpointComponent } from './connect-endpoint.component';

// TODO: Fix after metrics has been sorted - STRAT-152
xdescribe('ConnectEndpointComponent', () => {
  let component: ConnectEndpointComponent;
  let fixture: ComponentFixture<ConnectEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConnectEndpointComponent],
      imports: [
        CommonModule,
        CoreModule,
        SharedModule,
        CoreTestingModule,
        createBasicStoreModule()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
