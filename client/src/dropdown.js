import React, { useEffect, useState } from 'react';
import Post from './Post';

export default function PostListByAuthor({author}) {
  const [users, setUsers] = useState([]);
  const [username,setUsername] = useState([]);
  //const [selectedAuthor, setSelectedAuthor] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/users').then(response => {
      response.json().then(users => {
        setUsers(users);
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
  }, [username]);

  return (
    <>
    <div>
    <select onChange={e => setUsername(e.target.value)} value={username}>
      <option value="">Select an author</option>
      {users.map(user => (
        <option key={user.username} value={user.username}>{user.username}</option>
      ))}
    </select>
      </div>
      
     
{posts.length > 0 && posts.map(post => (
         
         <Post key={post.username} {...post} />
       ))}
         
       </>
        
  );
}


