import { CanActivate, HttpException, Injectable } from '@nestjs/common';
import { SemesterService } from 'src/services';

@Injectable()
export class AllowStudentRegisterTopicGuard implements CanActivate {
  constructor(private readonly semesterService: SemesterService) {}

  async canActivate(): Promise<boolean> {
    try {
      const isAllowRegisterTopic =
        await this.semesterService.allowPublishTopic();
      if (!isAllowRegisterTopic) {
        throw new HttpException('Hiện không thể đăng ký đề tài', 400);
      }
    } catch (error) {
      console.log('error AllowStudentRegisterTopicGuard', error);

      throw new HttpException('Hiện không thể đăng ký đề tài', 400);
    }
    return true;
  }
}
