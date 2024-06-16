import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../Editor";

export default function EditPost() {
    const {id}= useParams();
    const [title,setTitle] = useState('');
    const [category,setCategory] = useState('');
    const [summary,setSummary] = useState('');
    const [content,setContent] = useState('');
    const [files, setFiles] = useState('');
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        fetch('http://localhost:4000/post/'+id)
          .then(response => {
            response.json().then(postInfo => {
              setTitle(postInfo.title);
              setCategory(postInfo.category);
              setContent(postInfo.content);
              setSummary(postInfo.summary);
            });
          });
      }, []);

    async function updatePost(ev) {
        ev.preventDefault();
        const data = new FormData();
        data.set('title', title);
        data.set('category', category);
        data.set('summary', summary);
        data.set('content', content);
        data.set('id', id);
        if (files?.[0]) {
          data.set('file', files?.[0]);
        }
        const response = await fetch('http://localhost:4000/post', {
          method: 'PUT',
          body: data,
          credentials: 'include',
        });
        if (response.ok) {
          setRedirect(true);
        }
      }
    if (redirect) {
        return <Navigate to={'/post/' +id} />
      }

      async function deletePost() {
        const response = await fetch(`http://localhost:4000/post/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          setRedirect(true);
        } else {
          alert('You are not authorized to delete this post');
        }
      }
    
      if (redirect) {
        return <Navigate to="/ " />;
      }

      return(
          <form onSubmit={updatePost}>
          <input type="title"
                 placeholder={'Title'}
                 value={title}
                 onChange={ev => setTitle(ev.target.value)}
               />
          <input type="category"
               placeholder={'category'}
               value={category}
               onChange={ev => setCategory(ev.target.value)} 
                />
          <input type="summary"
                 placeholder={'Summary'}
                 value={summary}
                 onChange={ev => setSummary(ev.target.value)} 
              />
          <input type="file" 
                 onChange={ev => setFiles(ev.target.files)} 
              />
       <Editor value={content} onChange={setContent} />
    
          <button style={{marginTop:'5px'}}>Update post</button> 
          <button onClick={deletePost} style={{ marginTop: '10px', color: 'red' }}>Delete Post</button>
    
        
        </form>
      );
  }