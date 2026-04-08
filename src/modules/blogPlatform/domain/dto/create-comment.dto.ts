export interface CreateCommentDto extends CreateCommentByPostDto {
  postId: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
}

export interface CreateCommentByPostDto {
  content: string;
}
