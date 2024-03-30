import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Link, RouterProvider, createBrowserRouter } from "react-router-dom";
import VideoPlayer from './components/course.jsx';

export const COURSES = [
  {
    id: 1,
    title: 'React',
    description: 'A JavaScript library for building user interfaces',
    instructor: 'John Doe',
    duration: '2h 30m',
    image: 'https://imgs.search.brave.com/77YRhxW6Y7k9fiocHMmVJVPjFYyCokNeyK2bdNTGH90/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9jb3Nh/c2RlZGV2cy5jb20v/bWVkaWEvcG9zdHMv/cGhvdG9zL3ZhbGUt/bGEtcGVuYS1jdXJz/b3MtcGxhdHppLnBu/Zw',
    driveUrl: 'https://drive.google.com',
    videos: [
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
      'https://drive.google.com/file/d/1yyffAYwaxBmMIDxkCrhKc-3u_laqZ8m4/preview',
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
  ]
  },
  {
    id: 2,
    title: 'Vue',
    description: 'The Progressive JavaScript Framework',
    instructor: 'Jane Doe',
    duration: '3h 15m',
    image: 'https://imgs.search.brave.com/77YRhxW6Y7k9fiocHMmVJVPjFYyCokNeyK2bdNTGH90/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9jb3Nh/c2RlZGV2cy5jb20v/bWVkaWEvcG9zdHMv/cGhvdG9zL3ZhbGUt/bGEtcGVuYS1jdXJz/b3MtcGxhdHppLnBu/Zw',
    driveUrl: 'https://drive.google.com',
    videos: [
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
  ]

  },
  {
    id: 3,
    title: 'Angular',
    description: 'One framework. Mobile & desktop',
    instructor: 'James Doe',
    duration: '1h 45m',
    image: 'https://imgs.search.brave.com/77YRhxW6Y7k9fiocHMmVJVPjFYyCokNeyK2bdNTGH90/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9jb3Nh/c2RlZGV2cy5jb20v/bWVkaWEvcG9zdHMv/cGhvdG9zL3ZhbGUt/bGEtcGVuYS1jdXJz/b3MtcGxhdHppLnBu/Zw',
    driveUrl: 'https://drive.google.com',
    videos: [
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
      'https://drive.google.com/file/d/1z5IiPv-kBCoINn95ztDpP4svBqKd5x7X/preview',
  ]

  },
]
let routes = COURSES.map((v)=>{
  return { path: "/courses/"+v.id, element: <VideoPlayer videos={v.videos} title={v.title} /> }
})
const router = createBrowserRouter([
    { path: "/", element: <App  courses={COURSES}/> },
    { path: "/courses", element: <App courses={COURSES} /> },
    ...routes
  ],
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
