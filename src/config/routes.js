import Home from '@/components/pages/Home';

export const routes = {
  home: {
    id: 'home',
    label: 'IHSG Screener',
    path: '/',
    icon: 'TrendingUp',
    component: Home
  }
};

export const routeArray = Object.values(routes);
export default routes;