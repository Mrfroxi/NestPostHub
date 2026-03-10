export interface CreatePostDto extends CreatePostByBlog {
  blogId: string;
  blogName: string;
}

export interface CreatePostByBlog {
  title: string;
  shortDescription: string;
  content: string;
}
