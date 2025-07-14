import { routeTree } from './routeTree.gen'
import { createRouter } from '@tanstack/react-router';

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety


export default router;