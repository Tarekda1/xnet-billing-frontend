import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvoiceProvider } from './context/InvoiceContext';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

// Lazy load the components
const Home = React.lazy(() => import('./pages/Home'));
const Settings = React.lazy(() => import('./pages/Settings'));
const FileViewer = React.lazy(() => import('./pages/FileViewer'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <InvoiceProvider>
        {/* Moved InvoiceProvider here */}
        <Router>
          <Layout>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/monthly-invoice" element={<Home />} />
                <Route path="/view/:fileId" element={<FileViewer />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </InvoiceProvider>
    </QueryClientProvider>
  );
};

export default App;
