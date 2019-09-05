import { denormalize } from 'normalizr';

import { StratosBaseCatalogueEntity } from '../../../core/src/core/entity-catalogue/entity-catalogue-entity';
import { EntityCatalogueHelpers } from '../../../core/src/core/entity-catalogue/entity-catalogue.helper';
import { IRequestTypeState } from '../app-state';
import { IRecursiveDelete } from '../effects/recursive-entity-delete.effect';
import { EntitySchema } from './entity-schema';

export interface IFlatTree {
  [entityKey: string]: Set<string>;
}

export class EntitySchemaTreeBuilder {

  private entityExcludes: string[];
  private entityConfig: StratosBaseCatalogueEntity;

  public getFlatTree(treeDefinition: IRecursiveDelete, state: IRequestTypeState): IFlatTree {
    const { entityConfig, guid } = treeDefinition;
    const schema = entityConfig.getSchema(treeDefinition.schemaKey);
    const denormed = denormalize(guid, schema, state);
    this.entityConfig = treeDefinition.entityConfig;
    this.entityExcludes = this.entityConfig.definition.recursiveDelete ? this.entityConfig.definition.recursiveDelete.excludes : [];
    return this.build(schema, denormed, undefined, true);
  }

  private build(schema: EntitySchema, entity: any, flatTree: IFlatTree = {}, root = false): IFlatTree {
    if (Array.isArray(schema)) {
      schema = schema[0];
    }
    if (!schema || !entity || this.entityExcludes.includes(schema.entityType)) {
      return flatTree;
    }
    const keys = schema.definition ? Object.keys(schema.definition) : null;
    if (Array.isArray(entity)) {
      return entity.reduce((newFlatTree, newEntity) => {
        return this.applySchemaToTree(keys, schema, newEntity, newFlatTree);
      }, flatTree);
    }
    if (!(schema instanceof EntitySchema)) {
      return Object.keys(schema).reduce((newflatTree, key) => {
        return this.build(schema[key], entity[key], newflatTree);
      }, flatTree);
    }
    return this.applySchemaToTree(keys, schema, entity, flatTree, root);
  }

  private applySchemaToTree(keys: string[], schema: EntitySchema, entity: any, flatTree: IFlatTree = {}, root = false) {
    if (!entity) {
      return flatTree;
    }
    const { definition } = schema;
    if (!schema.getId) {
      return this.build(schema[schema.entityType], schema[schema.entityType], flatTree);
    }
    // Don't add the root element to the tree to avoid duplication actions whe consuming tree
    if (!root) {
      flatTree = this.addIdToTree(flatTree, schema.entityType, schema.getId(entity));
    }
    if (!keys) {
      return flatTree;
    }
    return keys.reduce((fullFlatTree, key) => {
      const newEntity = entity[key];
      const entityDefinition = this.getDefinition(definition[key]);
      if (Array.isArray(newEntity)) {
        return this.build(entityDefinition, newEntity, fullFlatTree);
      }

      return this.handleSingleChildEntity(entityDefinition, newEntity, fullFlatTree, key);
    }, flatTree);
  }

  private addIdToTree(flatTree: IFlatTree, key: string, newId: string) {
    const entityKey = EntityCatalogueHelpers.buildEntityKey(key, this.entityConfig.endpointType);
    const ids = flatTree[entityKey] || new Set<string>();
    flatTree[entityKey] = ids.add(newId);
    return flatTree;
  }

  private getDefinition(definition) {
    if (Array.isArray(definition)) {
      return definition[0];
    }
    return definition;
  }

  private handleSingleChildEntity(entityDefinition: EntitySchema, entity, flatTree: IFlatTree, key: string) {
    if (!entity) {
      return flatTree;
    }
    if (!(entityDefinition instanceof EntitySchema)) {
      return this.build(entityDefinition, entity, flatTree);
    }
    const id = entityDefinition.getId(entity);
    const entityKeys = flatTree[key];
    if (!id || (entityKeys && entityKeys.has(id))) {
      if (entityDefinition.definition) {
        return this.build(entityDefinition.definition as EntitySchema, entity, flatTree);
      }
      return flatTree;
    }
    flatTree = this.addIdToTree(flatTree, key, id);
    const subKeys = Object.keys(entityDefinition);
    if (subKeys.length > 0) {
      return this.build(entityDefinition, entity, flatTree);
    }
    return flatTree;
  }
}

