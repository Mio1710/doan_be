import { CanActivate, HttpException, Injectable } from '@nestjs/common';
import { SemesterService } from 'src/services';

@Injectable()
export class AllowRegisterTopicGuard implements CanActivate {
  constructor(private readonly semesterService: SemesterService) {}

  async canActivate(): Promise<boolean> {
    const isAllowRegisterTopic =
      await this.semesterService.allowRegisterTopic();
    if (!isAllowRegisterTopic) {
      throw new HttpException('Hiện không mở đăng ký đề tài', 400);
    }
    return true;
  }
}
