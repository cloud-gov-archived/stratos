import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GeneralAppState, connectedEndpointsOfTypesSelector } from '@stratosui/store';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

import { ApiEntityType } from '../../api-drive-views.types';

@Component({
  selector: 'app-api-endpoint-select-page',
  templateUrl: './api-endpoint-select-page.component.html',
  styleUrls: ['./api-endpoint-select-page.component.scss']
})
export class ApiEndpointSelectPageComponent implements OnInit {
  public connectedEndpointsOfType$: Observable<ApiEntityType[]>;
  constructor(
    private store: Store<GeneralAppState>,
    private route: ActivatedRoute,
    private router: Router
  ) { }
  public endpointSelected(endpoint: ApiEntityType) {
    this.router.navigate([endpoint.type], { relativeTo: this.route });
  }
  ngOnInit() {
    const endpointType = this.route.snapshot.params.endpointType;

    this.connectedEndpointsOfType$ = this.store.select(connectedEndpointsOfTypesSelector(endpointType)).pipe(
      map(endpointsMap => Object.values(endpointsMap)),
      filter(endpoints => !!endpoints || !endpoints.length),
      map(endpoints => endpoints.map(endpoint => new ApiEntityType(
        endpoint.guid,
        endpoint.name
        //  TODO Get icon from entity catalog
      )))
    );
  }

}
