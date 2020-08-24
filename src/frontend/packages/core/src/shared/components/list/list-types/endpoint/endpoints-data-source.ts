import { Store } from '@ngrx/store';
import {
  EndpointModel,
  AppState,
  EntityMonitorFactory,
  InternalEventMonitorFactory,
  PaginationMonitorFactory,
  stratosEntityCatalog,
} from '@stratosui/store';

import { IListConfig } from '../../list.component.types';
import { BaseEndpointsDataSource } from './base-endpoints-data-source';

export class EndpointsDataSource extends BaseEndpointsDataSource {
  store: Store<AppState>;

  constructor(
    store: Store<AppState>,
    listConfig: IListConfig<EndpointModel>,
    paginationMonitorFactory: PaginationMonitorFactory,
    entityMonitorFactory: EntityMonitorFactory,
    internalEventMonitorFactory: InternalEventMonitorFactory
  ) {
    super(
      store,
      listConfig,
      stratosEntityCatalog.endpoint.actions.getAll(),
      null,
      paginationMonitorFactory,
      entityMonitorFactory,
      internalEventMonitorFactory,
      false
    );
  }
}
