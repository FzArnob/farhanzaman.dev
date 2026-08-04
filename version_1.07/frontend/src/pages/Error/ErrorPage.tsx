import { useEffect } from 'react';
import { useProfile } from '../../data/ProfileContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { synchronizeInfo, sync, type SyncPage } from '../../lib/sync';
import './error.css';

interface ErrorPageProps {
  page: SyncPage;
  heading: string;
  message: string;
}

export function ErrorPage({ page, heading, message }: ErrorPageProps) {
  const { info } = useProfile();
  useDocumentTitle(heading);

  useEffect(() => {
    synchronizeInfo(
      sync.pages[page],
      sync.features.full_page,
      sync.activities.page_view,
      sync.actions.visit
    );
  }, [page]);

  return (
    <div className="error-page bg1 c1">
      <div className="error-container">
        <h1>{heading}</h1>
        <p>{message}</p>
        <a href={info.website_base_url + '/'}>Go back to {info.website_domain_name}</a>
      </div>
    </div>
  );
}

export const NotFoundPage = () => (
  <ErrorPage page="not_found" heading="404 Not Found" message="Oops! A page you looking for does not exist." />
);

export const ForbiddenPage = () => (
  <ErrorPage
    page="forbidden"
    heading="403 Forbidden"
    message="Sorry! You do not have the privilege to access this page."
  />
);

export const ServerErrorPage = () => (
  <ErrorPage
    page="server_error"
    heading="500 Internal Error"
    message="Sorry! Server is not responding to your request."
  />
);
