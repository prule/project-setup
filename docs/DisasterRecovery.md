# Disaster Recovery & Backups

Hope is not a strategy. We must plan for catastrophic failures (e.g., a regional AWS outage, a dropped production table, or a ransomware attack).

## 1. Key Objectives
- **RPO (Recovery Point Objective):** The maximum amount of data we are willing to lose. Target: **5 minutes**.
- **RTO (Recovery Time Objective):** How fast the system must be restored and functional. Target: **1 hour**.

## 2. Database Backups
- **Automated Snapshots:** The database provider (e.g., RDS, Supabase) must take full automated snapshots daily.
- **Point-in-Time Recovery (PITR):** The database must have PITR enabled, allowing us to roll the database back to any exact second within the last 7 days. This is our primary defense against an accidental `DROP TABLE` or corrupting migration.

## 3. Infrastructure as Code (IaC)
To meet our RTO, all infrastructure (servers, load balancers, DNS) must be defined in code (e.g., Terraform or Pulumi). In the event of a total regional failure, we must be able to deploy the entire infrastructure stack to a new region via a single CI/CD script.
