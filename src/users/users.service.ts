import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfile } from 'src/interfaces/user-profile.interface';
import { User } from 'src/interfaces/user.interface';
import { User as UserEntity } from 'src/typeorm/entities/user.entity';
import { Profile as ProfileEntity } from 'src/typeorm/entities/profile.entity';
import { Post as PostEntity } from 'src/typeorm/entities/post.entity';
import { Repository } from 'typeorm';
import { UserPost } from 'src/interfaces/user-post.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
  ) {}

  findUsers() {
    return this.userRepository.find({ relations: ['profile', 'posts'] });
  }

  createUser(user: User) {
    const newUser = this.userRepository.create({
      ...user,
      createdAt: new Date(),
    });
    return this.userRepository.save(newUser);
  }

  updateUser(id: number, user: User) {
    return this.userRepository.update({ id }, { ...user });
  }

  deleteUser(id: number) {
    return this.userRepository.delete(id);
  }

  async createUserProfile(id: number, userProfile: UserProfile) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found! Cannot create profile',
        HttpStatus.BAD_REQUEST,
      );

    const newProfile = this.profileRepository.create(userProfile);
    const savedProfile = await this.profileRepository.save(newProfile);
    user.profile = savedProfile;
    return this.userRepository.save(user);
  }

  async createUserPost(id: number, userPost: UserPost) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user)
      throw new HttpException(
        'User not found! Cannot create post',
        HttpStatus.BAD_REQUEST,
      );

    const newPost = this.postRepository.create({ ...userPost, user });
    return this.postRepository.save(newPost);
  }

  getPosts() {
    return this.postRepository.find({ relations: ['user'] });
  }
}
