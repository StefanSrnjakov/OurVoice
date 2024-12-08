// Header.tsx
import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from '../routes';
import { UserContext } from '../userContext';

interface RouteType {
  name: string;
  to: string;
  visible: boolean;
  element: React.ReactNode;
}

const Header: React.FC = () => {
  const { user } = useContext(UserContext); // Pridobimo stanje prijavljenega uporabnika iz konteksta

  // Nastavimo vidne poti glede na to ali je uporabnik prijavljen ali ne
  const routesToShow = user ? protectedRoutes : publicRoutes;

  return (
    <div className="container">
      <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
        <Link
          to="/"
          className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-dark text-decoration-none"
        >
          <span className="fs-4">Your Voice</span>
        </Link>

        <ul className="nav nav-pills">
          {/* Prikaz poti glede na prijavo */}
          {routesToShow
            .filter((route) => route.visible)
            .map((route: RouteType) => (
              <li key={route.to} className="nav-item">
                <NavLink
                  to={route.to}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                >
                  {route.name}
                </NavLink>
              </li>
            ))}
        </ul>
      </header>
    </div>
  );
};

export default Header;
