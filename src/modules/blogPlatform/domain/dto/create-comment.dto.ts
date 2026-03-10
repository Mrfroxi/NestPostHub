export interface CreateCommentDto extends CreateCommentByPostDto {
  postId: string;
}

export interface CreateCommentByPostDto {
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
}
