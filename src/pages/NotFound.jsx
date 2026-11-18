import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** 404 fallback page. */
export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <div className="container">
      <EmptyState
        icon={Compass}
        title="This page laced up and left"
        description="The page you are looking for does not exist. Head back to the store and find your pair."
      >
        <Button to="/">Back to home</Button>
        <Button to="/products" variant="outline">
          Shop sneakers
        </Button>
      </EmptyState>
    </div>
  );
}
