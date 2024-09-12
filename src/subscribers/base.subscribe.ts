import { ClsService } from 'nestjs-cls';
import { BaseEntity } from 'src/entities/base.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';

@EventSubscriber()
export class BaseSubscriber implements EntitySubscriberInterface<BaseEntity> {
  constructor(
    dataSource: DataSource,
    private readonly cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo(): string | Function {
    return BaseEntity;
  }

  beforeInsert(event: InsertEvent<BaseEntity>): void | Promise<any> {
    console.log('event', this.cls.get('userId'));

    if (event.entity && !event.entity.deleted_at) {
      event.entity.created_by = event.entity.created_by
        ? event.entity.created_by
        : this.cls.get('userId');
    }
  }

  beforeUpdate(event: UpdateEvent<BaseEntity>): void | Promise<any> {
    if (event.entity) {
      if (event.entity.deleted_at) {
        event.entity.deleted_by = this.cls.get('userId');
      }
      event.entity.updated_by = this.cls.get('userId');
    }
  }
}
