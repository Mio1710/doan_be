import { Command, CommandRunner } from 'nest-commander';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/services'; // Adjust the import according to your service location
import * as bcrypt from 'bcrypt';
import { CreateUserDTO } from 'src/dtos';

const saltOrRounds = 10;

@Command({
  name: 'add-admin',
  description: 'Add an admin user to the database',
})
@Injectable()
export class AddAdminCommand extends CommandRunner {
  constructor(private readonly usersService: UserService) {
    super();
  }

  async run(): Promise<void> {
    const rawMatkhau = '123123123';
    const matkhau = await bcrypt.hash(rawMatkhau, saltOrRounds);

    console.log('hash password:', matkhau);

    const admin: CreateUserDTO = {
      maso: 'admin',
      hodem: 'admin',
      ten: 'admin',
      email: 'admin@iuh.com',
      phone: '0123456789',
      type: 'admin',
      matkhau,
    };

    try {
      await this.usersService.create(admin);
      console.log(`Admin user ${admin.maso} added successfully.`);
    } catch (error) {
      console.error('Error adding admin user:', error);
    }
  }
}
