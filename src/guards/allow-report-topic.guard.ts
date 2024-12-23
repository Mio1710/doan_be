import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { ReportTopicService } from 'src/services';

@Injectable()
export class AllowReportTopicGuard implements CanActivate {
  constructor(private readonly reportTopic: ReportTopicService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    console.log('request', request.user);

    const isAllowRegisterGroup = await this.reportTopic.checkStudentGroup(
      request.user.id,
    );
    if (!isAllowRegisterGroup) {
      throw new HttpException('Chưa thể nộp báo cáo', 400);
      return false;
    }
    return true;
  }
}
