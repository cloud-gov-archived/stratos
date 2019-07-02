import {
  OrchestratedActionBuilders,
} from '../../../core/src/core/entity-catalogue/action-orchestrator/action-orchestrator';
import {
  GetApplication,
  DeleteApplication,
  CreateNewApplication,
  UpdateExistingApplication,
  UpdateApplication,
  RestageApplication,
  GetAllApplications
} from '../actions/application.actions';
import { IApp } from '../../../core/src/core/cf-api.types';
import { AppMetadataTypes } from '../actions/app-metadata.actions';

export class ApplicationActionBuilder implements OrchestratedActionBuilders {
  [actionType: string]: import("../../../core/src/core/entity-catalogue/action-orchestrator/action-orchestrator").OrchestratedActionBuilder<any, import("../../../store/src/types/request.types").IRequestAction | import("../../../store/src/types/pagination.types").PaginatedAction>;
  public get = (
    guid,
    endpointGuid: string,
    includeRelations = [],
    populateMissing = true
  ) => new GetApplication(guid, endpointGuid, includeRelations, populateMissing);
  delete = (guid: string, endpointGuid: string) => new DeleteApplication(guid, endpointGuid);
  create = (endpointGuid: string, guid: string, application: IApp) => new CreateNewApplication(guid, endpointGuid, application);
  update = (
    guid: string,
    endpointGuid: string,
    updatedApplication: UpdateApplication,
    existingApplication?: IApp,
    updateEntities?: AppMetadataTypes[]
  ) => new UpdateExistingApplication(guid, endpointGuid, updatedApplication, existingApplication, updateEntities);
  getAll = (
    paginationKey: string,
    endpointGuid: string,
    includeRelations = [],
    populateMissing = false
  ) => new GetAllApplications(paginationKey, endpointGuid, includeRelations, populateMissing);
  restage = (guid: string, endpointGuid: string) => new RestageApplication(guid, endpointGuid);
}

export const applicationActionBuilder = new ApplicationActionBuilder();


