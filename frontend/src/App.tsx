import { onMount, type Component } from 'solid-js';
import { getProfile } from './api';
import { setProfile } from './store';
import { Route, Router } from '@solidjs/router';
import RootLayout from './components/layout/RootLayout';
import HomePage from './pages/HomePage';
import ChroniclesPage from './pages/ChroniclesPage';
import ArticlePage from './pages/ArticlePage';
import CodexPage from './pages/CodexPage';
import ProjectPage from './pages/ProjectPage';
import { AboutPage, LaboratoryPage } from './pages/OtherPages';
import AdminGuard from './components/AdminGuard';
import AdminPage from './pages/AdminPage';

import { TekCore } from './modules/tekcore';

const App: Component = () => {
    onMount(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch {
      // Если бэкенд недоступен — store остаётся null,
      // компоненты покажут fallback-значения.
    }
  });

  return (
    <Router>
      <Route path="/" component={RootLayout}>
        <Route path="/"                 component={HomePage} />
        <Route path="/chronicle"        component={ChroniclesPage} />
        <Route path="/chronicle/:slug"  component={ArticlePage} />
        <Route path="/codex"            component={CodexPage} />
        <Route path="/codex/:slug"      component={ProjectPage} />
        <Route path="/codex/:project/:slug" component={ArticlePage} />
        <Route path="/laboratory"       component={LaboratoryPage} />
        <Route path="/laboratory/:slug" component={ArticlePage} />
        <Route path="/about"            component={AboutPage} />
        <Route path="/admin"            component={() => ( <AdminGuard><AdminPage /></AdminGuard> )} />
      </Route>

      { /* Подключение страниц-модулей */}
      
      <Route path="/nanograd/tekcore" component={TekCore.Layout}>
        <Route path="/" component={TekCore.Landing} />
        <Route path="/docs/:slug" component={TekCore.Doc} />
        <Route path="/secret" component={TekCore.Secret} />
      </Route>
    </Router>
  );
};

export default App;
