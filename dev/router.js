import Router from 'falcor-router';

import videoRoutes from './routes/video-routes';
import userRoutes from './routes/user-routes';
import commentRoutes from './routes/comment-routes';
import ratingRoutes from './routes/rating-routes';
import statsRoutes from './routes/stats-routes';

// Route definitions
const routes = [
  ...videoRoutes,
  ...userRoutes,
  ...commentRoutes,
  ...ratingRoutes,
  ...statsRoutes
];

// The actual router class
class KillrVideoRouter extends Router.createClass(routes) {
  constructor(userContext) {
    super();
    
    // Save user context for use in routes
    this.userContext = userContext;
  }
}

// Export the class
export default KillrVideoRouter;