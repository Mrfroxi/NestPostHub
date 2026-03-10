export interface CreatePostDto extends CreatePostByBlog {
  blogId: string;
}

export interface CreatePostByBlog {
  title: string;
  shortDescription: string;
  content: string;
}
