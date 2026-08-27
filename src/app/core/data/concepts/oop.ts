import { ConceptContent } from '../../models/content.model';

export const OOP: ConceptContent = {
  categoryId: 'java-core',
  topicId: 'java-core',
  conceptId: 'oop',
  title: 'OOP',
  topicType: 'concept',

  prerequisites: [],

  simpleIntuition:
    'ShopSphere is currently running as a Spring Boot prototype on Asutosh’s laptop. In the very first draft, ' +
    'Asutosh and Sushil wrote everything procedurally: loose parallel arrays for String[] productNames, double[] prices, ' +
    'and int[] stocks passed across dozens of static helper methods. Then during a midnight test checkout, an off-by-one ' +
    'index bug corrupted the catalog, selling a ₹14,999 Sony noise-cancelling headphone for ₹499. The procedural code ' +
    'had zero boundaries, zero ownership, and any function anywhere could mutate prices unchecked. Object-Oriented ' +
    'Programming is how ShopSphere rebuilds its entire engine: bundling state and the rules that guard that state ' +
    'into self-contained living objects, shielding domain invariants and making invalid business states impossible.',

  formalMeaning:
    'Object-Oriented Programming (OOP) is a paradigm organized around "objects" — cohesive runtime instances that ' +
    'encapsulate state (fields) and behavior (methods). It is founded upon four pillars: Encapsulation (hiding ' +
    'internal data behind guarded interfaces to guarantee invariant validity), Abstraction (decoupling high-level ' +
    'intent from underlying execution mechanics via interfaces and abstract classes), Polymorphism (enabling ' +
    'interchangeable runtime behaviors through dynamic dispatch and virtual method tables), and Inheritance ' +
    '(hierarchical subtyping for specialization and polymorphism). In production software architecture, Composition ' +
    '("has-a" relationship) serves as the indispensable fifth principle, favored over deep inheritance hierarchies ' +
    'to avoid the fragile base class dilemma.',

  whyItExists:
    'Without OOP, software degenerates into procedural chaos: data structures float freely in memory, and business rules ' +
    'are scattered across hundreds of decoupled services. If you need to enforce a rule like "stock cannot drop below zero" ' +
    'or "discounts cannot exceed 70%", procedural code relies on every developer remembering to check that condition ' +
    'before every mutation. One missed check corrupts production databases. Furthermore, adding new payment providers ' +
    '(UPI, Credit Card, Gift Card, Crypto) in procedural systems forces engineers to edit massive if-else or switch ' +
    'ladders across every checkout workflow. OOP solves both dilemmas: Encapsulation gives data an active gatekeeper ' +
    'that prevents corruption at the source, and Polymorphic Abstraction allows you to introduce new business capabilities ' +
    'purely by writing new classes rather than modifying existing, battle-tested code.',

  howItWorksInternally: [
    'Classes vs Objects in JVM Memory: A Class (Product.java) is a metadata blueprint stored in JVM Metaspace containing method bytecode and field layout definitions. When `new Product("WH-1000XM5", 14999.00)` executes, the JVM allocates a contiguous memory block on the Heap. The 12-to-16 byte object header contains the Mark Word (locking, GC age, hash code) and the Klass Pointer (referencing Product.class in Metaspace), followed by its instance fields.',
    'Encapsulation & State Invariants: Fields are declared `private`, denying external code direct memory-write access. Public domain methods (`deductStock(quantity)`, `updatePrice(newPrice)`) act as guarded bouncers that validate business rules before modifying memory. If an invalid quantity or negative price is supplied, the method rejects it immediately, guaranteeing the object is never left in a corrupted state.',
    'Abstraction (Interfaces & Abstract Classes): An interface (`PaymentGateway`) declares WHAT contract must be fulfilled (`PaymentReceipt charge(...)`) without exposing HOW it executes. An abstract class (`OrderProcessor`) implements common template algorithms while leaving abstract hooks for subclasses. Callers write code against the abstract contract, completely decoupled from third-party SDKs.',
    'Inheritance & The "Is-A" Hierarchy: A subclass (`PhysicalProduct extends Product`) inherits fields and methods from its superclass via `super()`, specializing behavior (e.g. adding shipping dimensions and weight). The Java compiler enforces strict subtyping: any method accepting `Product` transparently accepts `PhysicalProduct` because it guarantees fulfillment of the base class contract.',
    'Polymorphism (Dynamic Dispatch & vtables): When `checkoutService.process(gateway)` calls `gateway.charge(...)`, the compiler does not hardcode the target method offset. At runtime, the JVM inspects the object\'s Klass Pointer on the Heap, indexes into that class\'s Virtual Method Table (vtable), and invokes the concrete implementation (e.g. `UpiPaymentGateway.charge()`) in O(1) time without branching.',
    'Composition over Inheritance (Has-A Architecture): Instead of constructing rigid multi-tier subclass trees (`DiscountedPhysicalProduct extends PhysicalProduct`), ShopSphere gives `Product` a reference to a `DiscountPolicy` interface. Swapping discounts from "Black Friday 20%" to "VIP Clearance 50%" happens dynamically at runtime by swapping the strategy instance, eliminating class explosion.'
  ],

  diagrams: [
    {
      definition: {
        variant: 'flow',
        direction: 'lr',
        nodes: [
          { id: 'meta', label: 'Metaspace', detail: 'Product.class bytecode & vtable', tone: 'accent' },
          { id: 'stack', label: 'JVM Stack (Thread)', detail: 'Local variable: Product p1 = 0x7FA0', tone: 'brand' },
          { id: 'header', label: 'Heap: Object Header', detail: 'Mark Word (8B) + Klass Ptr (4B)', tone: 'muted' },
          { id: 'fields', label: 'Heap: Instance Fields', detail: 'name: "Sony", price: 14999, stock: 10', tone: 'ok' }
        ],
        edges: [
          { from: 'stack', to: 'header', label: 'points to' },
          { from: 'header', to: 'meta', label: 'Klass ptr' },
          { from: 'header', to: 'fields', label: 'contains' }
        ]
      },
      caption: 'Anatomy of Classes & Objects: Metaspace blueprint, JVM Stack reference, and Heap memory layout.'
    },
    {
      definition: {
        variant: 'hub',
        hub: {
          id: 'oop-core',
          label: 'Living Object (Heap)',
          detail: 'State (fields) + Invariant Rules (methods)',
          tone: 'brand'
        },
        spokes: [
          {
            node: {
              id: 'encap',
              label: 'Encapsulation',
              detail: 'Private fields & self-enforcing guards'
            },
            edgeLabel: 'protects'
          },
          {
            node: {
              id: 'abstr',
              label: 'Abstraction',
              detail: 'Clean contracts (PaymentGateway)'
            },
            edgeLabel: 'decouples'
          },
          {
            node: {
              id: 'inher',
              label: 'Inheritance',
              detail: 'True "Is-A" subtyping & specialization'
            },
            edgeLabel: 'specializes'
          },
          {
            node: {
              id: 'poly',
              label: 'Polymorphism',
              detail: 'Dynamic dispatch via JVM vtable'
            },
            edgeLabel: 'dispatches'
          },
          {
            node: {
              id: 'comp',
              label: 'Composition',
              detail: '"Has-A" pluggable policies over rigid trees'
            },
            edgeLabel: 'extends'
          }
        ]
      },
      caption: 'The OOP Architectural Core: How Encapsulation, Abstraction, Inheritance, Polymorphism, and Composition work together.'
    },
    {
      definition: {
        variant: 'flow',
        direction: 'lr',
        nodes: [
          { id: 'caller', label: 'CheckoutService', detail: 'gateway.charge(order)', tone: 'brand' },
          { id: 'interface', label: 'PaymentGateway', detail: 'Interface reference on Stack', tone: 'accent' },
          { id: 'heap-obj', label: 'Heap Instance: 0x82B0', detail: 'Concrete UpiPaymentGateway', tone: 'brand' },
          { id: 'vtable', label: 'vtable Slot 0', detail: 'Virtual Method Table index', tone: 'warn' },
          { id: 'exec', label: 'UpiPaymentGateway.charge()', detail: 'Dispatched in O(1) time', tone: 'ok' }
        ],
        edges: [
          { from: 'caller', to: 'interface', label: 'calls' },
          { from: 'interface', to: 'heap-obj', label: 'dereferences' },
          { from: 'heap-obj', to: 'vtable', label: 'indexes' },
          { from: 'vtable', to: 'exec', label: 'executes' }
        ]
      },
      caption: 'Polymorphic Dynamic Dispatch: How the JVM executes method overrides via vtable lookup without if/else branching.'
    },
    {
      definition: {
        variant: 'split',
        left: {
          title: 'Rigid Inheritance (Is-A Hierarchy)',
          items: [
            'Product (Base Class)',
            'PhysicalProduct extends Product',
            'DiscountedPhysicalProduct extends PhysicalProduct',
            'ClearanceHolidayPhysicalProduct extends DiscountedPhysicalProduct',
            'Fragile Base Class problem: modifying Product breaks all 14 subclasses'
          ]
        },
        right: {
          title: 'Flexible Composition (Has-A Architecture)',
          items: [
            'Product has-a DiscountPolicy interface reference',
            'Product has-a ShippingStrategy interface reference',
            'Product has-a TaxCalculator interface reference',
            'Interchangeable strategies injected dynamically at runtime',
            'Zero code duplication; 1 single Product class handles all combinations'
          ]
        },
        verdict: 'Default to Composition for behavior and policy reuse; reserve Inheritance strictly for immutable, genuine "Is-A" taxonomy.'
      },
      caption: 'Inheritance vs Composition: The architectural choice that prevents class explosion in production.'
    }
  ],

  codeExamples: [
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 1. CLASSES & OBJECTS: Blueprint vs Living Instances on the JVM Heap\n' +
        '// ==========================================================================\n' +
        'public class Product {\n' +
        '    // State (Fields / Instance Variables)\n' +
        '    private final String id;\n' +
        '    private final String name;\n' +
        '    private double basePrice;\n' +
        '    private int stockLevel;\n\n' +
        '    // Constructor: Initializes the living instance and guarantees valid initial state\n' +
        '    public Product(String id, String name, double basePrice, int stockLevel) {\n' +
        '        if (basePrice <= 0) throw new IllegalArgumentException("Base price must be positive");\n' +
        '        if (stockLevel < 0) throw new IllegalArgumentException("Stock cannot be negative");\n' +
        '        this.id = Objects.requireNonNull(id, "ID required");\n' +
        '        this.name = Objects.requireNonNull(name, "Name required");\n' +
        '        this.basePrice = basePrice;\n' +
        '        this.stockLevel = stockLevel;\n' +
        '    }\n' +
        '}\n\n' +
        '// Client code instantiating distinct living objects on the Heap:\n' +
        'Product p1 = new Product("PROD-01", "Sony WH-1000XM5", 14999.00, 10); // Heap: 0x7FA0\n' +
        'Product p2 = new Product("PROD-02", "Logitech MX Master 3S", 7999.00, 25); // Heap: 0x81C0',
      explanation:
        'Product.java is the blueprint (stored in Metaspace). Executing `new Product(...)` allocates a separate living ' +
        'instance with its own independent state in JVM Heap memory.'
    },
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 2. ENCAPSULATION: Guarding Invariants vs The Anemic Domain Smell\n' +
        '// ==========================================================================\n' +
        'public class Product {\n' +
        '    private double basePrice;\n' +
        '    private int stockLevel;\n\n' +
        '    // DO NOT write mindless setters like: public void setStockLevel(int s) { this.stockLevel = s; }\n' +
        '    // That recreates procedural vulnerabilities where callers can write negative stock.\n\n' +
        '    // Behavior-Driven Mutation: State can only transition through verified business logic\n' +
        '    public void deductStock(int quantity) {\n' +
        '        if (quantity <= 0) {\n' +
        '            throw new IllegalArgumentException("Quantity must be greater than zero");\n' +
        '        }\n' +
        '        if (quantity > this.stockLevel) {\n' +
        '            throw new InsufficientStockException("Cannot fulfill " + quantity + ", stock: " + this.stockLevel);\n' +
        '        }\n' +
        '        this.stockLevel -= quantity; // Invariant safely maintained\n' +
        '    }\n\n' +
        '    public void applySeasonalDiscount(double discountPercentage) {\n' +
        '        if (discountPercentage < 0 || discountPercentage > 70.0) {\n' +
        '            throw new IllegalArgumentException("Discount out of legal bounds (0% - 70%)");\n' +
        '        }\n' +
        '        this.basePrice = this.basePrice * (1.0 - (discountPercentage / 100.0));\n' +
        '    }\n' +
        '}',
      explanation:
        'Encapsulation means private fields combined with behavior-rich domain methods. The entity guards its own ' +
        'rules, making it impossible for external callers to leave the object in an illegal state.'
    },
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 3. INHERITANCE: Subtyping, Specialization, and the `super` Keyword\n' +
        '// ==========================================================================\n' +
        'public abstract class Product {\n' +
        '    private final String id;\n' +
        '    private final String name;\n' +
        '    protected double basePrice;\n\n' +
        '    public Product(String id, String name, double basePrice) {\n' +
        '        this.id = id;\n' +
        '        this.name = name;\n' +
        '        this.basePrice = basePrice;\n' +
        '    }\n\n' +
        '    public abstract FulfillmentReceipt fulfill(Customer customer);\n' +
        '}\n\n' +
        '// PhysicalProduct IS-A Product with physical warehouse delivery logistics\n' +
        'public class PhysicalProduct extends Product {\n' +
        '    private final double weightGrams;\n' +
        '    private final Dimensions dimensions;\n\n' +
        '    public PhysicalProduct(String id, String name, double price, double weight, Dimensions dims) {\n' +
        '        super(id, name, price); // Invokes superclass constructor\n' +
        '        this.weightGrams = weight;\n' +
        '        this.dimensions = dims;\n' +
        '    }\n\n' +
        '    @Override\n' +
        '    public FulfillmentReceipt fulfill(Customer customer) {\n' +
        '        // Dispatch warehouse picker, generate BlueDart courier tracking label\n' +
        '        return new FulfillmentReceipt(this.getId(), "COURIER-BLUEDART-88219");\n' +
        '    }\n' +
        '}\n\n' +
        '// DigitalProduct IS-A Product with instant download & license generation\n' +
        'public class DigitalProduct extends Product {\n' +
        '    private final String downloadUrl;\n\n' +
        '    public DigitalProduct(String id, String name, double price, String downloadUrl) {\n' +
        '        super(id, name, price);\n' +
        '        this.downloadUrl = downloadUrl;\n' +
        '    }\n\n' +
        '    @Override\n' +
        '    public FulfillmentReceipt fulfill(Customer customer) {\n' +
        '        // Generate signed S3 link, email license key instantly\n' +
        '        return new FulfillmentReceipt(this.getId(), "DIGITAL-TOKEN-X719");\n' +
        '    }\n' +
        '}',
      explanation:
        'Inheritance creates an "Is-A" relationship. Both PhysicalProduct and DigitalProduct reuse common Product state ' +
        'while specializing fulfillment. Callers expecting `Product` work seamlessly with both.'
    },
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 4. POLYMORPHISM: Compile-Time (Overloading) vs Runtime (Dynamic Dispatch)\n' +
        '// ==========================================================================\n' +
        'public class CatalogSearchService {\n' +
        '    // 4A. Compile-Time Polymorphism (Method Overloading) — Resolved by compiler\n' +
        '    public List<Product> search(String query) {\n' +
        '        return search(query, 0.0, Double.MAX_VALUE);\n' +
        '    }\n\n' +
        '    public List<Product> search(String query, double minPrice, double maxPrice) {\n' +
        '        return db.findMatching(query, minPrice, maxPrice);\n' +
        '    }\n' +
        '}\n\n' +
        '// 4B. Runtime Polymorphism (Method Overriding & Dynamic Dispatch)\n' +
        'public interface PaymentGateway {\n' +
        '    PaymentReceipt charge(String orderId, double amount);\n' +
        '}\n\n' +
        'public class UpiPaymentGateway implements PaymentGateway {\n' +
        '    @Override public PaymentReceipt charge(String orderId, double amount) {\n' +
        '        return new PaymentReceipt(orderId, "UPI-REF-" + UUID.randomUUID(), true);\n' +
        '    }\n' +
        '}\n\n' +
        'public class CreditCardPaymentGateway implements PaymentGateway {\n' +
        '    @Override public PaymentReceipt charge(String orderId, double amount) {\n' +
        '        return new PaymentReceipt(orderId, "CC-AUTH-" + UUID.randomUUID(), true);\n' +
        '    }\n' +
        '}\n\n' +
        '// CheckoutService relies purely on Dynamic Dispatch — ZERO if/else branching!\n' +
        'public class CheckoutService {\n' +
        '    public PaymentReceipt process(Order order, PaymentGateway gateway) {\n' +
        '        // At runtime, JVM indexes gateway\'s vtable and routes to concrete charge()\n' +
        '        return gateway.charge(order.id(), order.totalAmount());\n' +
        '    }\n' +
        '}',
      explanation:
        'Overloading is static polymorphism decided at compile-time by method signatures. Overriding is dynamic ' +
        'polymorphism where the JVM inspects the runtime object heap header and executes via vtable dynamic dispatch.'
    },
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 5. ABSTRACTION: Interfaces vs Abstract Classes (Template Method Pattern)\n' +
        '// ==========================================================================\n' +
        '// Abstract Class defines the immutable skeleton algorithm + abstract hooks\n' +
        'public abstract class OrderFulfillmentWorkflow {\n' +
        '    // Template Method: Defines the rigid step sequence that callers cannot alter\n' +
        '    public final OrderReceipt processOrder(Order order) {\n' +
        '        validateInventory(order);\n' +
        '        PaymentReceipt payment = executePayment(order);\n' +
        '        FulfillmentReceipt fulfillment = dispatchGoods(order);\n' +
        '        notifyCustomer(order, payment, fulfillment);\n' +
        '        return new OrderReceipt(order.id(), "COMPLETED");\n' +
        '    }\n\n' +
        '    private void validateInventory(Order order) { /* Shared invariant check */ }\n' +
        '    private void notifyCustomer(Order o, PaymentReceipt p, FulfillmentReceipt f) { /* Shared SMS/Email */ }\n\n' +
        '    // Abstract Hooks: Subclasses must customize these specific steps\n' +
        '    protected abstract PaymentReceipt executePayment(Order order);\n' +
        '    protected abstract FulfillmentReceipt dispatchGoods(Order order);\n' +
        '}',
      explanation:
        'Abstraction hides complex workflows. Interfaces define pure behavioral contracts, while Abstract Classes ' +
        'combine shared template algorithms with customizable abstract hooks.'
    },
    {
      language: 'java',
      code:
        '// ==========================================================================\n' +
        '// 6. COMPOSITION OVER INHERITANCE: Strategy Pattern for Business Policies\n' +
        '// ==========================================================================\n' +
        'public interface DiscountPolicy {\n' +
        '    double applyDiscount(double originalPrice);\n' +
        '}\n\n' +
        'public class NoDiscountPolicy implements DiscountPolicy {\n' +
        '    @Override public double applyDiscount(double price) { return price; }\n' +
        '}\n\n' +
        'public class PercentageDiscountPolicy implements DiscountPolicy {\n' +
        '    private final double percent;\n' +
        '    public PercentageDiscountPolicy(double percent) { this.percent = percent; }\n' +
        '    @Override public double applyDiscount(double price) { return price * (1.0 - percent / 100.0); }\n' +
        '}\n\n' +
        '// Product HAS-A DiscountPolicy rather than extending DiscountedProduct\n' +
        'public class Product {\n' +
        '    private double basePrice;\n' +
        '    private DiscountPolicy discountPolicy; // Composition!\n\n' +
        '    public Product(String name, double basePrice) {\n' +
        '        this.basePrice = basePrice;\n' +
        '        this.discountPolicy = new NoDiscountPolicy();\n' +
        '    }\n\n' +
        '    public void setDiscountPolicy(DiscountPolicy policy) {\n' +
        '        this.discountPolicy = Objects.requireNonNull(policy);\n' +
        '    }\n\n' +
        '    public double getFinalPrice() {\n' +
        '        return this.discountPolicy.applyDiscount(this.basePrice);\n' +
        '    }\n' +
        '}',
      explanation:
        'Composition achieves flexible behavior reuse without inheritance hierarchies. Swapping policies is as ' +
        'simple as calling `product.setDiscountPolicy(new PercentageDiscountPolicy(20))`, with zero subclass explosion.'
    }
  ],

  mainComponents: [
    'Classes & Objects (The Blueprint & The Living Instance) — A class defines metadata and invariants in Metaspace; an object is an independent living memory allocation residing on the JVM Heap.',
    'Encapsulation (The Storeroom Bouncer) — Private fields combined with guarded domain methods ensuring invalid business states (negative balances, overselling stock) can never be committed.',
    'Abstraction (The Public Contract) — Exposing clean interfaces (PaymentGateway) and abstract template workflows while hiding third-party APIs, database calls, and cryptography from consumers.',
    'Inheritance (The "Is-A" Taxonomy) — Subclassing base classes to inherit common structure and specialize behaviors via `super()` and method overrides.',
    'Polymorphism & Dynamic Dispatch — Runtime method resolution where interface and superclass invocations dispatch to concrete subtype methods via class virtual method tables (vtables).',
    'Composition (Has-A Architecture) — Assembling complex behaviors by holding modular interface references rather than constructing rigid multi-tier inheritance trees.'
  ],

  realWorldExamples: [
    'ShopSphere Payment Routing: An e-commerce checkout accepting 6 different payment providers (Razorpay, Stripe, UPI, PayPal, Gift Cards, CoD) through a unified `PaymentGateway` interface without branching logic.',
    'Spring Framework Dependency Injection: `ApplicationContext` managing bean lifecycles where services depend on repository interfaces (`OrderRepository`), while the underlying implementation (JPA, Hibernate, In-Memory for testing) is swapped via configuration.',
    'Java Collections Framework: Methods accepting `List<T>` or `Map<K, V>` abstractions, allowing callers to transparently switch between `ArrayList`, `LinkedList`, `HashMap`, or `ConcurrentHashMap` with zero call-site refactoring.'
  ],

  complexityAndTradeoffs: [
    'Encapsulation Overhead vs Data Integrity: Encapsulation requires explicit constructors, validation logic, and domain methods rather than public field access. In return, it eliminates 100% of silent state corruption bugs across multi-developer teams.',
    'Dynamic Dispatch Performance: Virtual method calls incur a tiny vtable indirection (typically 1–3 CPU cycles). The HotSpot JIT compiler optimizes predictable call-sites aggressively via Monomorphic Inlining, achieving raw direct-call speeds.',
    'Inheritance Rigidity vs Code Reuse: Deep inheritance trees (`Manager extends Employee extends Person`) create the Fragile Base Class problem where modifying a parent breaks child classes unexpectedly. Composition incurs minor delegation code in exchange for zero architectural lock-in.',
    'Memory Footprint: Every JVM heap object carries a 12-byte (with Compressed OOPs) or 16-byte object header plus field alignment padding. For millions of tiny primitives, high-performance engines prefer primitive arrays or Java Value Types (Project Valhalla).'
  ],

  commonMistakes: [
    'The "Anemic Domain Model" (Mindless Getters & Setters): Generating public getters and setters for every private field without validation recreates procedural code with extra boilerplate. External callers can still execute `product.setStock(-50)`. Fix: Remove public setters entirely; mutate state solely through validated, intent-revealing domain methods (`product.deductStock(qty)`).',
    'Inheritance for Pure Code Reuse: Using `extends` simply because class B wants two helper methods from class A, forcing an unnatural "Is-A" relationship that breaks when requirements change. Fix: Apply the "Composition Over Inheritance" rule — inject class A as a private field inside class B ("Has-A") and delegate to it.',
    'Confusing Overloading (Compile-Time) with Overriding (Runtime Dynamic Dispatch): Assuming that method overloading (`pay(int)` vs `pay(String)`) is resolved by the runtime object. Overloading is static polymorphism resolved by the compiler at compile-time based on reference types; only overriding uses dynamic dispatch based on runtime heap types.'
  ],

  interviewPerspective:
    'Senior interviewers never ask for textbook definitions of the four pillars. Instead, they test your understanding ' +
    'of internal runtime mechanics and architectural trade-offs. You will frequently be presented with a broken, ' +
    'tangled inheritance hierarchy (e.g., an e-commerce shipping calculator with 15 subclass combinations) and asked ' +
    'how to refactor it using Composition and Strategy interfaces. You will also be grilled on how the JVM resolves ' +
    '`animal.makeSound()` when reference is `Animal` but instance is `Dog`, expecting you to explain dynamic dispatch, ' +
    'the class header pointer, and vtable indexing.',

  triggerSentence:
    'The four pillars are not vocabulary to memorize — they are four specific architectural shields that stop a growing codebase from collapsing under its own weight.',

  stepPlayer: {
    title: 'watch-it-run — OOP Lifecycle, Encapsulation & Dynamic Dispatch',
    scenario: 'Product sony = new Product("WH-1000XM5", 14999); checkoutService.processOrder(order, upiGateway);',
    code: [
      'Product product = new Product("WH-1000XM5", 14999.00);',
      'product.deductStock(1); // Guarded invariant',
      'PaymentGateway gateway = new UpiPaymentGateway(); // Abstraction',
      'CheckoutService checkout = new CheckoutService();',
      '// Inside checkout.processOrder(order, gateway):',
      'PaymentReceipt receipt = gateway.charge(order.id(), 14999.00);',
      '// JVM executes: 0x82B0.vtable[0] -> UpiPaymentGateway.charge()'
    ],
    footnote: 'Dynamic dispatch resolves gateway.charge() via the class vtable in O(1) time without any if/else branching.',
    frames: [
      {
        badge: 'Metaspace: Product.class & PaymentGateway.class',
        caption: 'The JVM loads Product and PaymentGateway bytecode into Metaspace, building their Virtual Method Tables (vtables).',
        codeLine: 1,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'JVM Metaspace',
              address: 'Class Metadata',
              tone: 'accent',
              fields: [
                { name: 'Product.class', value: 'Blueprint (Fields + Bytecode)', tone: 'accent' },
                { name: 'PaymentGateway.class', value: 'Interface (charge signature)', tone: 'brand' },
                { name: 'UpiPaymentGateway.class', value: 'vtable[0] -> charge()', tone: 'ok' }
              ]
            },
            {
              title: 'JVM Stack (main)',
              address: 'Frame 0',
              tone: 'brand',
              fields: [
                { name: 'args', value: 'String[0]', tone: 'muted' },
                { name: 'product', value: 'uninitialized', tone: 'warn' }
              ]
            }
          ]
        }
      },
      {
        badge: 'Heap: 0x7FA0 (Product Instance)',
        caption: 'new Product(...) allocates 32 bytes on the Heap. Constructor verifies basePrice > 0 and stockLevel >= 0 before committing.',
        codeLine: 1,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'JVM Stack (main)',
              address: 'Frame 0',
              tone: 'brand',
              fields: [
                { name: 'product', value: '-> 0x7FA0 (Heap Ref)', tone: 'brand' }
              ]
            },
            {
              title: 'Heap: Product Instance',
              address: '0x7FA0',
              tone: 'brand',
              fields: [
                { name: 'Mark Word', value: '0x00000001 (Unlocked)', tone: 'muted' },
                { name: 'Klass Pointer', value: '-> Product.class', tone: 'accent' },
                { name: 'name', value: '"WH-1000XM5"', tone: 'brand' },
                { name: 'basePrice', value: '14999.00', tone: 'ok' },
                { name: 'stockLevel', value: '10 (In Stock)', tone: 'ok' }
              ]
            }
          ]
        }
      },
      {
        badge: 'Encapsulation Guard: Stock 10 -> 9',
        caption: 'product.deductStock(1) runs business invariant check (10 >= 1). Validation passes; state updates safely. External code could not corrupt this.',
        codeLine: 2,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'Heap: Product Instance',
              address: '0x7FA0',
              tone: 'ok',
              fields: [
                { name: 'name', value: '"WH-1000XM5"', tone: 'brand' },
                { name: 'basePrice', value: '14999.00', tone: 'brand' },
                { name: 'stockLevel', value: '9 (1 item deducted)', tone: 'ok' },
                { name: 'Invariant Check', value: 'PASSED (qty <= stock)', tone: 'ok' }
              ]
            },
            {
              title: 'Encapsulation Shield',
              address: 'Domain Method Guard',
              tone: 'brand',
              fields: [
                { name: 'Direct Field Write', value: 'BLOCKED (private)', tone: 'danger' },
                { name: 'Mutator Method', value: 'deductStock(int qty)', tone: 'ok' }
              ]
            }
          ]
        }
      },
      {
        badge: 'Abstraction: Reference vs Instance',
        caption: 'Variable "gateway" on stack is typed as PaymentGateway interface. The actual object on Heap is UpiPaymentGateway (0x82B0).',
        codeLine: 3,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'JVM Stack (main)',
              address: 'Frame 0',
              tone: 'brand',
              fields: [
                { name: 'product', value: '-> 0x7FA0', tone: 'brand' },
                { name: 'PaymentGateway gateway', value: '-> 0x82B0 (Heap Ref)', tone: 'accent' }
              ]
            },
            {
              title: 'Heap: UpiPaymentGateway',
              address: '0x82B0',
              tone: 'accent',
              fields: [
                { name: 'Klass Pointer', value: '-> UpiPaymentGateway.class', tone: 'accent' },
                { name: 'vtable[0]', value: 'UpiPaymentGateway.charge()', tone: 'brand' }
              ]
            }
          ]
        }
      },
      {
        badge: 'CheckoutService.processOrder(...)',
        caption: 'CheckoutService receives the generic PaymentGateway interface reference. It has zero knowledge of UPI or Credit Card internals.',
        codeLine: 4,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'Stack: processOrder Frame',
              address: 'Frame 1',
              tone: 'brand',
              fields: [
                { name: 'this', value: 'CheckoutService (0x51E0)', tone: 'muted' },
                { name: 'order', value: 'Order #4091 (₹14,999)', tone: 'brand' },
                { name: 'gateway', value: '-> 0x82B0', tone: 'accent' }
              ]
            },
            {
              title: 'Abstraction Boundary',
              address: 'Clean Decoupling',
              tone: 'brand',
              fields: [
                { name: 'Contract', value: 'PaymentGateway.charge()', tone: 'brand' },
                { name: 'If/Else Ladders', value: 'ZERO Branching', tone: 'ok' }
              ]
            }
          ]
        }
      },
      {
        badge: '0x82B0.vtable[0] -> UpiPaymentGateway.charge()',
        caption: 'JVM executes gateway.charge(). It inspects 0x82B0 Klass pointer, jumps to UpiPaymentGateway.vtable[0], and executes in O(1) time!',
        codeLine: 6,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'Dynamic Dispatch Engine',
              address: 'JVM HotSpot Runtime',
              tone: 'ok',
              fields: [
                { name: 'Target Reference', value: '0x82B0 (UpiPaymentGateway)', tone: 'accent' },
                { name: 'vtable Lookup', value: 'Slot 0 (charge)', tone: 'brand' },
                { name: 'Executed Method', value: 'UpiPaymentGateway.charge()', tone: 'ok' }
              ]
            },
            {
              title: 'Heap: PaymentReceipt',
              address: '0x99A0',
              tone: 'ok',
              fields: [
                { name: 'orderId', value: '#4091', tone: 'brand' },
                { name: 'txnRef', value: '"UPI-REF-91024"', tone: 'accent' },
                { name: 'status', value: 'SUCCESS', tone: 'ok' }
              ]
            }
          ]
        }
      },
      {
        badge: 'Pluggable Extensibility',
        caption: 'If CreditCardPaymentGateway (0x94C0) is passed instead, the exact same call site executes CreditCardPaymentGateway.charge(). CheckoutService never changes!',
        codeLine: 7,
        visual: {
          type: 'memory-heap',
          blocks: [
            {
              title: 'Heap: CreditCardPaymentGateway',
              address: '0x94C0',
              tone: 'accent',
              fields: [
                { name: 'Klass Pointer', value: '-> CreditCardPaymentGateway.class', tone: 'accent' },
                { name: 'vtable[0]', value: 'CreditCardPaymentGateway.charge()', tone: 'brand' }
              ]
            },
            {
              title: 'Open-Closed Principle',
              address: 'Polymorphic Payoff',
              tone: 'ok',
              fields: [
                { name: 'Existing Code', value: '100% UNMODIFIED', tone: 'ok' },
                { name: 'New Provider Added', value: 'Purely by writing new Class', tone: 'brand' }
              ]
            }
          ]
        }
      }
    ]
  },

  scenarioDrills: [
    {
      situation:
        'ShopSphere’s shipping engine started with `StandardShippingCalculator`. Over 6 months, developers added ' +
        '`ExpressShippingCalculator extends StandardShippingCalculator`, then `InternationalExpressShippingCalculator`, ' +
        'and `HolidayDiscountedInternationalExpressShippingCalculator`. Now management wants a "Prime Free Next-Day" option, ' +
        'and the inheritance tree has 14 classes with duplicated override logic.',
      question:
        'How do you explain the architectural flaw to the team, and how do you refactor this to clean OOP without breaking existing checkout endpoints?',
      answer:
        '1. Diagnose the Root Cause: The team fell into the Fragile Base Class trap by using multi-tier inheritance for combinatorial feature variations instead of true subtyping.\n\n' +
        '2. Refactor to Composition & Strategy Pattern: Split the calculation into independent orthogonal concerns:\n' +
        '   - `ShippingSpeedStrategy` (Standard, Express, NextDay)\n' +
        '   - `TaxZonePolicy` (Domestic, International)\n' +
        '   - `PromotionDiscount` (None, Prime, Holiday)\n\n' +
        '3. Create a Single Composite Engine: `ShippingEngine` holds references to these interfaces ("Has-A") and computes final rates by delegating to each policy.\n\n' +
        '4. Maintain Backward Compatibility: Keep the original `ShippingCalculator` interface intact at the boundary so `CheckoutService` endpoints experience zero breaking changes.'
    }
  ],

  rapidFire: [
    {
      question: 'What is Dynamic Dispatch and how does the JVM execute it?',
      answer:
        'Dynamic dispatch is runtime method resolution. When a method is called on an interface or superclass reference, the JVM inspects the object’s heap header, follows its Klass pointer to the class metadata, looks up the method offset in the virtual method table (vtable), and executes the concrete subtype implementation in O(1) time.'
    },
    {
      question: 'Why is an Anemic Domain Model considered a design smell?',
      answer:
        'An Anemic Domain Model consists of entities with private fields and blind public getters/setters with zero business logic. It separates data from validation, turning classes into passive data bags and forcing business rules into scattered service layers, defeating encapsulation.'
    },
    {
      question: 'What is the precise difference between Method Overloading and Method Overriding?',
      answer:
        'Overloading is compile-time (static) polymorphism where methods in the same class share names with different parameter signatures, resolved entirely by the compiler. Overriding is runtime (dynamic) polymorphism where a subclass redefines an inherited method with identical signature, resolved at runtime via dynamic dispatch.'
    }
  ],

  relatedConcepts: [
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'solid',
      title: 'SOLID Principles',
      note: 'SOLID represents OOP done right — 5 concrete architectural rules guiding how classes, interfaces, and dependencies should be structured.'
    },
    {
      categoryId: 'java-core',
      topicId: 'java-core',
      conceptId: 'generics',
      title: 'Generics',
      note: 'Generics extend polymorphism from methods and objects to the type system itself, ensuring type safety without runtime casting.'
    }
  ]
};
