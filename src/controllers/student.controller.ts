import { Controller, Get, Post } from '@nestjs/common';
import { User } from 'src/entities';
import { UserService } from 'src/services';

@Controller('students')
export class StudentController {
  constructor(private readonly appService: UserService) {}

  @Get()
  getListUsers(): Promise<User[]> {
    return this.appService.getLists();
  }

  @Post()
  createUser(user: User): Promise<User> {
    return this.appService.create(user);
  }
}
