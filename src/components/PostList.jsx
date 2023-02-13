import React, { useState, useEffect } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Post from './Post'
import PostFilter from './PostFilter';
import { usePosts } from '../hooks/usePost';
import { getAll } from './../API/PostApi';
import useFetching from './../hooks/useFetching';
import { getPageCount } from './../utils/pages';
import PostCreate from './PostCreate.jsx';
import MyModal from './UI/MyModal.jsx';
import Loader from './UI/Loader.jsx';
import MyButton from './UI/MyButton';
import usePages from '../hooks/usePages';
import Pages from './UI/Pages';

export default function PostList(props) {

  const [posts, setPosts] = useState([{id:1, title:'123'}]);
  const [filter, setFilter] = useState({ sort: '', query: '' });
  const [modal, setModal] = useState();
  const sortedSearchedPosts = usePosts(posts, filter.sort, filter.query);

  const [totalPages, setTotalPages] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);


  useEffect(() => { loadingPosts() }, []);

  const [loadingPosts, isPostLoading, postError] = useFetching(async () => {
    console.log(limit, page);
    const res = await getAll(limit, page);
    setPosts(res.data);
    setTotalPages(getPageCount(res.headers['x-total-count'], limit));
  });
  //console.log(totalPages);

  const limitArray = usePages(totalPages, limit);
  //console.log(limitArray);


  function createPost(newPost) {
    setPosts([...posts, { ...newPost }]);
    setModal(false);
  }

  function removePost(post) {
    setPosts(posts.filter(p => p.id !== post.id));
  }

  function upLoadPosts(index) {
    console.log('receive page form pages: ', index);
    setPage(index);
    loadingPosts();
    //setPosts(posts);
  }

  

  return (
    <div>
      <MyButton style={{marginTop: 20}} onClick={()=>setModal(true)}>Create user</MyButton> 
      {sortedSearchedPosts.length > 0
        ? <h1 style={{ textAlign: 'center' }}>{props.title}</h1>
        : <h1 style={{ textAlign: 'center' }}>Посты не найдены</h1>
      }
      {postError && <h1>Произошла ошибка ${postError}</h1>}
      <MyModal visible={modal} setVisible={setModal}>
        <PostCreate create={createPost} />
      </MyModal>
      {isPostLoading &&
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
          <Loader />
        </div>
      }
      <PostFilter filter={filter} setFilter={setFilter} />
      
      <hr></hr>
      <Pages array={limitArray} limit={limit} onClick={upLoadPosts}/>
      <TransitionGroup>
        {sortedSearchedPosts.map((post, index) =>
          <CSSTransition
            key={post.id}
            timeout={500}
            classNames='post'
          >
            <Post remove={removePost} index={post.id} post={post} key={post.id} />
          </CSSTransition>
        )
        }
      </TransitionGroup>
        
    </div>
  )
}
