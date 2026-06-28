# Performance & Optimization

Performance is a feature. Fast applications lead to better user retention, higher conversion rates, and better SEO.

## 1. Frontend Performance
- **Core Web Vitals:** Monitor LCP (Largest Contentful Paint), INP (Interaction to Next Paint), and CLS (Cumulative Layout Shift). Cloudflare Web Analytics can assist with this.
- **Code Splitting & Lazy Loading:** Do not ship a single massive JavaScript bundle. Use React's `lazy()` and `Suspense` to load route components only when the user navigates to them.
- **Image Optimization:** 
  - Never serve raw, unoptimized images.
  - Use modern formats like WebP or AVIF.
  - Provide explicit `width` and `height` attributes to prevent CLS.
- **Bundle Size:** Regularly audit your bundle size. If a dependency is too large (e.g., Moment.js), find a lightweight alternative (e.g., date-fns or native Intl API).

## 2. Backend Performance
- **Database Indexing:** Ensure columns frequently used in `WHERE`, `JOIN`, or `ORDER BY` clauses are indexed. A missing index is the most common cause of slow APIs.
- **The N+1 Query Problem:** Be careful when using ORMs (like JPA/Hibernate). Fetching a list of entities and then looping through them to fetch their relations can trigger hundreds of queries. Use `JOIN FETCH` or batch fetching to solve this.
- **Caching:**
  - Cache heavy, infrequently changing calculations or API responses.
  - Use appropriate Cache-Control headers so Cloudflare/Browsers can cache responses at the edge.

## 3. Network Optimization
- Keep payloads small. Use pagination for lists.
- Enable gzip or Brotli compression on the server/CDN (handled automatically by Cloudflare Pages).
