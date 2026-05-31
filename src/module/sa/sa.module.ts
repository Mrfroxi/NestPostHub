import { Module } from '@nestjs/common';
import { UserAccountsModule } from '@src/module/user-accounts/user-accounts.module';
import { BlogModule } from '@src/module/blog/blog.module';
import { SaUserController } from '@src/module/sa/api/sa-user.controller';
import { SaBlogsController } from '@src/module/sa/api/sa-blogs.controller';
import { CreateBlogUseCase } from '@src/module/sa/application/useCases/create-blog.usecase';
import { UpdateBlogUseCase } from '@src/module/sa/application/useCases/update-blog.usecase';
import { DeleteBlogUseCase } from '@src/module/sa/application/useCases/delete-blog.usecase';
import { CreatePostUseCase } from '@src/module/sa/application/useCases/create-post.usecase';
import { UpdatePostUseCase } from '@src/module/sa/application/useCases/update-post.usecase';
import { SaConfig } from '@src/module/sa/config/sa.config';
import { SABasicAuthGuard } from '@src/module/sa/guards/sa-basic-auth.guard';

@Module({
  imports: [UserAccountsModule, BlogModule],
  controllers: [SaUserController, SaBlogsController],
  providers: [
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    SaConfig,
    SABasicAuthGuard,
  ],
})
export class SaModule {}
