import { useEffect, useState, useCallback } from "react";

import "./AppProfile.css";
import PostLists from "./PostLists";
import ApiFunctions from "../ApiFunctions";
import AppHeader from "../templates/AppHeader";
import AppLayout from "../templates/AppLayout";

function AppProfile() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [username, setUsername] = useState("loading...");

  const handleuserInfo = async () => {
    try {
      const response = await ApiFunctions.handleGetUser();
      if (response.ok) {
        const data = await response.json();
        setUsername(data.userInfo.username);
      }
    } catch (error) {
      console.error("error fetching user info: ", error);
      setUsername("can not loading user info");
    }
  };

  const getUserPosts = useCallback(async () => {
    try {
      const response = await ApiFunctions.handleGetPostsForUser();
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        getAllComments(data.posts);
      }
    } catch (error) {
      console.error("error fetching user posts:", error);
    }
  }, []);

  const getAllComments = async (posts) => {
    try {
      const allComments = {};
      for (const post of posts) {
        const response = await ApiFunctions.handleGetCommentsForPost(post.id);
        if (response.ok) {
          const data = await response.json();
          allComments[post.id] = data.comments.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        }
      }

      setComments(allComments);
    } catch (error) {
      console.error("error fetching comments:", error);
    }
  };

  useEffect(() => {
    handleuserInfo();
    getUserPosts();
  }, [getUserPosts]);

  return (
    <div className="app-profile">
      <AppHeader />
      <AppLayout>
        <div className="profile-top">
          <div className="profile-pic">PIC</div>
          <h2 className="profile-name">{username}</h2>
        </div>

        <div className="profile-posts">
          <PostLists
            posts={posts || []}
            comments={comments || {}}
            refreshComments={getAllComments}
          />
        </div>
      </AppLayout>
    </div>
  );
}

export default AppProfile;
