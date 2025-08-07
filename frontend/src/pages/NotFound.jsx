import { Link } from 'react-router-dom';
import React, {useState, useEffect} from 'react'

export default function NotFoundPage() {
    useEffect(() => {
        const navbar = document.querySelector('.navigation-bar');
        const hubview = document.querySelector('.hub-view');
        if (navbar) navbar.style.display = 'none';
        if (hubview) hubview.style.display = 'none';

        return () => {
            if (navbar) navbar.style.display = '';
            if (hubview) hubview.style.display = '';
        };
    }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 text-gray-900">Page Not Found</h2>
        <p className="text-gray-600 mt-2">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
