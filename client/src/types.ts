export interface User {
    createdAt: string;
    updatedAt: string;
    username: string;
    email: string;
}

export interface Sub {
    createdAt: string;
    updateAt: string;
    name: string;
    title: string;
    description: string;
    imageUrn: string;
    bannerUrn: string;
    username: string;
    posts: Post[];
    postCount?: string;
    
    imageUrl: string;
    bannerUrl: string;
}

export interface Post {
    createdAt: string;
    updatedAt: string;
    identifier: string;
    title: string;
    slug: string;
    body: string;
    subName: string;
    userName: string;
    sub?: Sub;

    url: string;
    userVote?: number;
    voteScore?: number;
    commentCount?: number;
}

export interface Comment {
    createdAt: string;
    updatedAt: string;
    identifier: string;
    body: string;
    username: string;
    post?: Post;

    userVote: string;
    voteScore: string;
}