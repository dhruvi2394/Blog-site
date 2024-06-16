import { formatInTimeZone } from 'date-fns-tz';
import { Link } from 'react-router-dom';



export default function Post({_id,title,category,summary,content,cover,createdAt,author}) {
    return(
        <div className="post">
        <h2>{title}</h2>
        <h3>{category}</h3>
          <div className="image">
            <Link to={`/post/${_id}`}>
              <img src={'http://localhost:4000/'+cover} alt="" />
            </Link>
  
          </div>
  <div className="texts">
  <Link to={`/post/${_id}`}>
  
  </Link>
  <p className="info">
    <a className="author">{author.username}</a>
    <time>{formatInTimeZone(createdAt, 'Asia/Kolkata', 'MMM d, yyyy HH:mm:ss zzz')}</time>
  </p>
  <p className="summary">{summary}</p>
  <div className="content" dangerouslySetInnerHTML={{__html:content}} />
  </div>
  </div>
    );
}