import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

const Posts = ({ posts, isLoading, isRefetching, feedType }) => {
  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} feedType={feedType}/>
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
