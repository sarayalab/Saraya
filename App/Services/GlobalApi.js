import { create } from 'apisauce'

const api = create({
    baseURL: 'https://newsapi.org/v2',

  })
  const apiKey='country=us&apiKey=dfdd33050b8a4fe9909f2c46bcaef59c';

  const getTopHeadline=api.get('/top-headlines?'+apiKey)
  const getByCategory=(category)=>api.get('/everything?q='+category+"&apiKey=dfdd33050b8a4fe9909f2c46bcaef59c")
  export default{
    getTopHeadline,
    getByCategory
  }