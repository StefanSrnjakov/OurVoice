export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  likes:string[];
  dislikes:string[];
  //userId: string;
  userId: {
    _id: string;
    username: string;
  };
  image: string
}
