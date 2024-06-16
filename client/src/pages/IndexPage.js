import Post from "../Post";
import {useEffect, useState} from "react";
//import PostListByAuthor from "../dropdown";
//import UserModel from "../../../api/models/User";

export default function IndexPage(author) {
  const [users, setUsers] = useState([]);
  const [username,setUsername] = useState([]);
 // const [selectedAuthor, setSelectedAuthor] = useState('');
  const [posts,setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/users').then(response => {
      response.json().then(users => {
        setUsers(users);
      });
    });
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/post').then(response => {
      response.json().then(posts => {
        setPosts(posts);
      });
    });
  }, []);

  useEffect(() => {
    if (username) {
      // Fetch posts by the selected author
      fetch(`http://localhost:4000/posts/users/${username}`).then(response => {
         response.json().then(posts => {
          setPosts(posts);
         });
    });
  }
  }, [username],[posts]);

  return ( 
    <>
      <div>
  <select onChange={e => setUsername(e.target.value)} value={username}>
    <option value="">Select an author</option>
    {users.map(user => (
      <option key={user._id} value={user.username}>{user.username}</option>
    ))}
  </select>
    </div>
    
     
      {posts.length > 0 && posts.map(post => (
       
        <Post key={post._id} {...post} />
      ))}
        
    </>
  );
}