import React from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Posts from './pages/Posts';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Categories from './pages/Categories';
import UserProfile from './pages/User';
import PenalUsers from './pages/PenalUsers';
import Banned from './pages/Banned';
import ReportedPosts from './pages/ReportedPosts';

export const publicRoutes = [
  { name: 'Domov', to: '/', visible: true, element: <Home /> },
  { name: 'Prijava', to: '/login', visible: true, element: <Login /> },
  {
    name: 'Registracija',
    to: '/register',
    visible: true,
    element: <Register />,
  },
  {
    name: 'Kategorije',
    to: '/categories',
    visible: true,
    element: <Categories />,
  },
  { name: 'Objave', to: '/posts', visible: true, element: <Posts /> },
  {
    name: 'Blokiran uporabnik',
    to: '/banned',
    visible: false,
    element: <Banned />,
  },
  { name: 'Odjava', to: '/logout', visible: false, element: <Logout /> },
];

export const protectedRoutes = [
  { name: 'Domov', to: '/', visible: true, element: <Home /> },
  { name: 'Objave', to: '/posts', visible: true, element: <Posts /> },
  { name: 'Profil', to: '/profile', visible: true, element: <Profile /> },
  {
    name: 'Kategorije',
    to: '/categories',
    visible: true,
    element: <Categories />,
  },
  { name: 'Odjava', to: '/logout', visible: true, element: <Logout /> },
  {
    name: 'Seznam uporabnikov',
    to: '/users',
    visible: false,
    element: <PenalUsers />,
  },
  {
    name: 'Seznam prijavljenih objav',
    to: '/reported',
    visible: false,
    element: <ReportedPosts />,
  },
  {
    name: 'Profil',
    to: '/user/:userId',
    visible: false,
    element: <UserProfile />,
  },
];
