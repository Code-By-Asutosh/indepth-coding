# Indepth Coding — Story Narration Style Guide & Master Context

> **THE PLATFORM DOCTRINE**:  
> Every lesson across the entire **Indepth Coding** platform is authored in **Story Narration Style**, modeled directly on Asutosh Nayak's Medium article series (*"Building ShopSphere"*).  
> **NO generic, disconnected textbook stages.**  
> Every concept is taught as an unfolding chapter in a real engineering journey.

---

## 1. Core Philosophy & The House Voice

- **"Simple, but simple that covers a lot."**
- **Compress, Never Dilute**: Never dumb a concept down—say everything a senior engineer needs to know with zero wasted words. Readable in ~3–5 minutes.
- **Narrative Flow**: Setup → Tension/Dilemma → Solution/Concept → Mechanism → Practical Code → Honest Trade-offs → Synthesis ("Put Together").
- **Honesty as Voice**: Trade-offs are not hidden in a separate generic box; they are spoken frankly inside the story (*"One honest cost worth knowing...", "The honest limitation...", "Genuinely overkill for ShopSphere today"*).
- **Prose Carries Explanations**: Use natural, conversational, punchy paragraphs. Bullet points are used *strictly* for genuine enumerations (e.g. 3 concrete properties of a security group).
- **One Relatable Analogy Anchor**: Exactly one strong everyday mental model per concept (*"public subnet is the shop's front counter, private subnet is the storeroom out back"*).

---

## 2. The Unified Universe: ShopSphere

Every technical concept across all categories attaches to the single evolving story of **ShopSphere** (an e-commerce platform built with Java, Spring Boot, Microservices, and AWS):

- **Characters**: Asutosh & Sushil (founders/lead engineers), Riya (engineering teammate).
- **Timeline / Acts**:
  - **Act I (Java Core)**: *The Laptop Era* — Running on Asutosh's laptop, solving memory, OOP boundaries, collections, and concurrency.
  - **Act II (Enterprise Java & Spring Boot)**: *Building the Real Backend* — Transactions, database persistence, REST APIs, and authentication.
  - **Act III (Databases & Concurrency)**: *Growth Pains* — Connection pools, locks, query plans, caching, and race conditions during flash sales.
  - **Act IV (Microservices & Messaging)**: *The Great Split* — Breaking the monolith into services, Kafka event streaming, API Gateway, and resilient distributed transactions.
  - **Act V (Cloud & AWS)**: *Going Public on AWS* — Regions, AZs, IAM, VPC, subnets, gateways, ECS, and auto-scaling.
  - **Act VI (DSA & System Design)**: *High-Performance Craft* — Two Pointers for gift-card matching, Sliding Window for sale streaks, Rate Limiting, and Caching.

---

## 3. The 10 Golden Rules of Story Narration

1. **Continuation Opening, Never Cold (`Picking up where we left off`)**:  
   Always start with 2–3 sentences describing where Asutosh & Sushil stand and the immediate problem they face today.
2. **Honest Promise**:  
   State what will be built and what the reader will understand by the end in plain English.
3. **Story Headings, Not Definition Headings**:  
   Numbered like article chapters with metaphorical or narrative names (e.g., `01 The gift-card bug`, `02 Walking from both ends`, `VPC, Your Own Private Plot of Land`).
4. **Each Section is a Mini-Story**:  
   Present the genuine dilemma first (*"Should customers reach the database directly? Obviously not."*) → Concept arrives as the answer → 2–6 lines of runnable code/CLI right there → What it accomplishes.
5. **Honest Trade-offs in Real Time**:  
   Acknowledge financial costs, memory/CPU overhead, and complexity as they occur.
6. **One-Line Memory Hook (`.hook`)**:  
   A single unforgettable sentence/invariant (*"⌘ Cheapest + most expensive is the only pair where ONE comparison tells you which item is innocent — always."*).
7. **Continuity Cross-References**:  
   Refer to earlier decisions as shared company history (*"Remember Part 1's rule, spread across AZs? This is where it gets applied."*).
8. **Visual Simulation (`▶ Watch it run`)**:  
   Embed the interactive step-player animation at the exact moment where *watching beats reading*.
9. **Synthesis Finale ("Put Together" Recap)**:  
   Summarize the assembled picture showing how every piece solved a real problem, followed by a teaser for the next chapter.
10. **War Room Appendix (After the Story)**:  
    Place interview preparation drills (`rapidFire` 1-breath definitions and `scenarioDrills` production war games) at the bottom in an accordion appendix.

---

## 4. Reference Templates (Canonical Medium Articles by Asutosh Nayak)

### Reference Template 1: *Building ShopSphere Part 1 — Where Does Your App Even Live?*
> **Topics**: AWS Global Infrastructure, Regions, Availability Zones, Edge Locations, IAM (Users, Roles, Policies), AWS Organizations.

```markdown
# Building ShopSphere Part 1: Where Does Your App Even Live?
(AWS Global Infrastructure, Regions, and IAM)

## The Story Begins
Meet Asutosh and Sushil. They’re building ShopSphere, an online store for handmade goods.
Right now, ShopSphere is a Spring Boot app running on Asutosh’s laptop. It works. But a laptop can’t serve real customers.

So the very first question is simple. Where does this app actually live?
Not “which cloud provider.” That part’s already decided: AWS. The real question is deeper: AWS has data centers all over the planet. Which one? Who’s even allowed to create anything there? What happens if that one data center catches fire?

This article answers exactly those questions, in the order a real team would actually ask them. Nothing here is decoration. Every AWS term you’re about to learn is the answer to something Asutosh and Sushil genuinely need to figure out before they deploy a single line of code.

---

## 1. AWS Global Infrastructure, the Big Picture
Think of AWS as a company that owns buildings all over the world.
Each building is packed with real servers, real hard drives, real networking gear. When you “use AWS,” you’re really renting a slice of one of these buildings.

AWS organizes this global footprint into three layers:
- **Regions**: A large geographic area, like Mumbai, Frankfurt, or Ohio.
- **Availability Zones**: Inside each region, several separate, physically distant data centers.
- **Edge Locations**: Smaller sites, spread even more widely, built for speed, not for running your app.

Why does this structure exist at all?
Because “put it in the cloud” still means “put it in a real, physical place.” And where you pick that place decides how fast your app feels, how safe your data is, and even whether you’re breaking the law.

---

## 2. Region, Choosing Where ShopSphere Lives
Asutosh and Sushil’s first real decision: which AWS Region should ShopSphere run in?
A Region is a specific geographic area where AWS has a cluster of data centers:
- `ap-south-1` (Mumbai)
- `us-east-1` (N. Virginia)
- `eu-west-1` (Ireland)

Every region runs completely independently. Nothing in Mumbai automatically talks to Ohio.
Most of ShopSphere’s customers are in India. So the obvious choice is `ap-south-1` (Mumbai).

Why does the choice matter so much?
- **Latency**: A customer in Bangalore hitting Mumbai gets a fast response. The same customer hitting Virginia waits far longer.
- **Data residency laws**: Some countries legally require certain data to stay within borders.
- **Price**: Not every region costs the same for the same service.
- **Service availability**: Newer AWS services often launch in a handful of regions first.

AWS CLI check:
```bash
aws configure get region
# ap-south-1
```
*One clean rule to remember: pick the region closest to most of your actual users, unless a law or a specific feature forces a different choice.*

---

## 3. Availability Zone, Why One Building Isn’t Enough
Say ShopSphere deploys everything into Mumbai. Good start. But which specific building in Mumbai?
An AZ is one or more physical data centers, with their own power, cooling, and networking, inside a region. Mumbai has three: `ap-south-1a`, `ap-south-1b`, `ap-south-1c`.

*Here’s the one-line version: a region is a city, an AZ is one specific building in that city.*

Why does this matter?
If ShopSphere puts every server in `ap-south-1a` only and a power outage hits, ShopSphere goes down completely.
If ShopSphere spreads servers across `ap-south-1a` and `ap-south-1b`:
- `ap-south-1a` loses power.
- `ap-south-1b` keeps running.
- Customers barely notice anything happened.

*This one idea—spread across AZs, never rely on just one—will come back again and again once ShopSphere reaches EC2, RDS, and load balancing.*

---

## 4. Edge Location, Getting Close to the Customer
Say ShopSphere later opens up to customers in the US. A customer in New York asks for a product image stored in Mumbai. Travelling to Mumbai and back for every image is slow.

Edge locations store a cached copy of frequently requested content close to the customer. Amazon CloudFront (AWS's CDN) is built on this edge network.

---

## 5. IAM, Before Anyone Touches AWS
Before creating a single server: Who is allowed to touch what?
Shared logins mean no audit trails, no revoking individual access, and no principle of least privilege.
Think of IAM as the front desk of a secure office building checking authentication (who are you?) and authorization (what are you allowed to do?).

---

## 6. IAM User, IAM Role, IAM Policy
- **IAM User**: One identity for one real person (e.g. `aws iam create-user --user-name asutosh`).
- **IAM Policy**: JSON document defining exact permissions (e.g., Read-only access to S3).
- **IAM Role**: Temporary credentials for services or servers without hardcoded secrets.

*One-line rule: give a person an IAM User, give a service or a server an IAM Role.*

---

## 7. AWS Organizations, One Company, Many Accounts
Managing separate accounts for Production, Staging, and Mobile Teams under one umbrella for isolation and consolidated billing.

---

## 8. Where ShopSphere Stands Now (Synthesis)
- Region: `ap-south-1` (Mumbai)
- High Availability: Spread across at least two AZs
- Edge: CloudFront for static assets
- Security: Separate IAM Users for Asutosh and Sushil, IAM Roles for backend apps.

*Part 2 picks up here: building the private VPC network.*
```

---

### Reference Template 2: *Building ShopSphere Part 2 — Building ShopSphere’s Private Network*
> **Topics**: VPC, Subnets (Public vs Private), Internet Gateway, NAT Gateway, Route Tables, Security Groups, Network ACLs, Elastic IP, VPC Peering, Transit Gateway, VPC Endpoints & PrivateLink, Direct Connect, VPN.

```markdown
# Building ShopSphere Part 2: Building ShopSphere’s Private Network
(VPC, Subnets, and Gateways)

## Picking Up Where We Left Off
Asutosh and Sushil now know two things: ShopSphere will run in Mumbai, spread across two Availability Zones, and every identity gets only the access it genuinely needs.
But there’s still no actual place to put a server. You need your own private, fenced-off network first.
That’s this entire article. By the end, ShopSphere will have a real, working network ready for servers and databases.

---

## 1. VPC, Your Own Private Plot of Land
Imagine AWS's Mumbai region as an enormous shared plot of land. Every company fences off their own private section:
```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --region ap-south-1
```
`10.0.0.0/16` is ShopSphere's private IP street address range.

---

## 2. Subnet, Dividing the Plot
Dividing the plot into smaller sections tied to specific AZs:
```bash
aws ec2 create-subnet --vpc-id vpc-shopsphere --cidr-block 10.0.1.0/24 --availability-zone ap-south-1a
aws ec2 create-subnet --vpc-id vpc-shopsphere --cidr-block 10.0.2.0/24 --availability-zone ap-south-1b
```

---

## 3. Public Subnet vs Private Subnet
Should customers directly reach the database? Obviously not.
- **Public Subnet**: Connected to internet (Load Balancer).
- **Private Subnet**: Sealed from direct internet access (Spring Boot app, RDS Database).

*One-line hook: Public subnet is the shop's front counter, private subnet is the storeroom out back.*

---

## 4. Internet Gateway, the Front Door
Attaching the main entrance to the VPC:
```bash
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=shopsphere-igw}]'
aws ec2 attach-internet-gateway --vpc-id vpc-shopsphere --internet-gateway-id igw-shopsphere
```

---

## 5. NAT Gateway, Going Out Without Letting Anyone In
Private app servers need to download security patches or call payment APIs without letting outsiders in:
```bash
aws ec2 create-nat-gateway --subnet-id subnet-public-a --allocation-id eipalloc-xxxx
```
*Honest cost: NAT Gateway has an hourly fee + per-GB data charge. A NAT instance is a cheaper early alternative, but managed NAT Gateway is the production standard.*

---

## 6. Route Table, the Signposts
A subnet becomes public or private purely based on whether its route table sends `0.0.0.0/0` to the Internet Gateway or the NAT Gateway.

---

## 7. Security Group, Guarding Each Server
Stateful firewall guarding individual EC2 instances:
```bash
aws ec2 authorize-security-group-ingress --group-id sg-shopsphere-app --protocol tcp --port 8080 --source-group sg-shopsphere-alb
```
*Allows traffic ONLY from the Application Load Balancer.*

---

## 8. Network ACL, Guarding Each Subnet
Stateless subnet-level firewall supporting explicit IP deny rules.

---

## 9. ShopSphere's Network, Put Together (Synthesis)
Every piece answered one genuine question. Public and private traffic are isolated, outbound calls are secure, and firewalls protect each boundary.
*Part 3 picks up here: Deploying Spring Boot onto EC2 behind an ALB.*
```

---

## 5. Instruction to AI Coding Models

When creating, updating, or authoring any lesson/concept file in this repository:
1. **Always use this Story Narration Doctrine.**
2. **Anchor the lesson into the ShopSphere timeline.**
3. **Use the characters Asutosh, Sushil, and Riya facing real technical challenges.**
4. **Follow the sequence**: Continuation Opening → Dilemma → Story Chapter 1 (with initial code/problem) → Memory Hook → Story Chapter 2 (mental model) → Step-Player / Diagram → Production Code → Honest Trade-offs → "Put Together" Recap → Next Teaser → War Room Appendix.
5. **No robotic bullet-point dumps or dry reference manuals.** Tell the story of how real software gets built.

