/**
 * Sample code for the Code style, one set per programming language. The
 * author picks a language and every showcase field they haven't edited —
 * the code behind the hero book, the chapter listing, file names, the stack
 * and the terminals — follows it. Every sample tells the same story: a
 * checkout that is safe to retry.
 */

export interface CodeSample {
  label: string;
  /** Open files above the code behind the hero book; the first is the open one. */
  tabs: string[];
  /** Code behind the hero book; lines starting with + are "added in this chapter". */
  hero: string;
  status: string[];
  stack: string[];
  codeFile: string;
  codePath: string;
  /** The listing in "inside a chapter". */
  code: string;
  notes: { text: string; lines: string }[];
  test: string;
  testResult: string;
  testCmd: string;
  testText: string;
  /** The closing terminal. */
  terminal: string;
}

const RETRY = "Take an idempotency key from the client and check it first. Seen it before? Return the original order instead of creating a new one.";

export const CODE_SAMPLES = {
  java: {
    label: "Java",
    tabs: ["OrderService.java", "Order.java", "application.yml"],
    hero: `package shop.orders;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orders;
    private final PaymentGateway payments;

    @Transactional
    public Order checkout(Cart cart, String key) {
+       if (orders.existsByKey(key)) return orders.findByKey(key);
+       if (cart.isEmpty()) throw new EmptyCartException();
+       var order = Order.from(cart, key);
+       payments.charge(order.total());
+       return orders.save(order);
    }
}`,
    status: ["Java 21", "UTF-8", "● 42 tests passing"],
    stack: ["Java 21", "Spring Boot 3", "PostgreSQL 16", "Docker", "JUnit 5", "Testcontainers"],
    codeFile: "OrderService.java",
    codePath: "src/main/java/shop/orders",
    code: `@Transactional
public Order checkout(Cart cart, String key) {
    if (orders.existsByKey(key)) {
        return orders.findByKey(key);
    }
    if (cart.isEmpty()) throw new EmptyCartException();

    var order = Order.from(cart, key);
    payments.charge(order.total());
    return orders.save(order);
}`,
    notes: [
      { text: RETRY, lines: "3-5" },
      { text: "Only then charge. With `@Transactional`, the order and the payment both happen — or neither does.", lines: "9" },
    ],
    test: "CheckoutIdempotencyTest",
    testResult: "3 passed · 0.41s",
    testCmd: "$ ./mvnw test",
    testText: "Unit and integration tests with Testcontainers.",
    terminal: `$ ./mvnw verify
[INFO] Tests run: 42, Failures: 0
[INFO] BUILD SUCCESS
$ docker compose up -d
Started ShopApplication in 1.84 seconds`,
  },

  kotlin: {
    label: "Kotlin",
    tabs: ["OrderService.kt", "Order.kt", "application.yml"],
    hero: `package shop.orders

@Service
class OrderService(
    private val orders: OrderRepository,
    private val payments: PaymentGateway,
) {

    @Transactional
    fun checkout(cart: Cart, key: String): Order {
+       orders.findByKey(key)?.let { return it }
+       require(cart.isNotEmpty()) { "Cart is empty" }
+       val order = Order.from(cart, key)
+       payments.charge(order.total)
+       return orders.save(order)
    }
}`,
    status: ["Kotlin 2.0", "UTF-8", "● 42 tests passing"],
    stack: ["Kotlin 2.0", "Spring Boot 3", "PostgreSQL 16", "Docker", "JUnit 5", "Testcontainers"],
    codeFile: "OrderService.kt",
    codePath: "src/main/kotlin/shop/orders",
    code: `@Transactional
fun checkout(cart: Cart, key: String): Order {
    orders.findByKey(key)?.let {
        return it
    }
    require(cart.isNotEmpty()) { "Cart is empty" }

    val order = Order.from(cart, key)
    payments.charge(order.total)
    return orders.save(order)
}`,
    notes: [
      { text: RETRY, lines: "3-5" },
      { text: "Only then charge. With `@Transactional`, the order and the payment both happen — or neither does.", lines: "9" },
    ],
    test: "CheckoutIdempotencyTest",
    testResult: "3 passed · 0.41s",
    testCmd: "$ ./gradlew test",
    testText: "Unit and integration tests with Testcontainers.",
    terminal: `$ ./gradlew build
42 tests completed, 0 failed
BUILD SUCCESSFUL in 8s
$ docker compose up -d
Started ShopApplicationKt in 1.92 seconds`,
  },

  python: {
    label: "Python",
    tabs: ["orders.py", "models.py", "pyproject.toml"],
    hero: `from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/checkout")
def checkout(cart: Cart, key: str = Header(...),
             db: Session = Depends(get_db)) -> Order:
+   if existing := orders.find_by_key(db, key):
+       return existing
+   if not cart.items:
+       raise EmptyCartError()
+   return place_order(db, cart, key)`,
    status: ["Python 3.12", "UTF-8", "● 42 tests passing"],
    stack: ["Python 3.12", "FastAPI", "PostgreSQL 16", "SQLAlchemy 2", "pytest", "Docker"],
    codeFile: "orders.py",
    codePath: "app/orders",
    code: `def checkout(db: Session, cart: Cart, key: str) -> Order:
    if existing := orders.find_by_key(db, key):
        return existing

    if not cart.items:
        raise EmptyCartError()

    with db.begin():
        order = Order.from_cart(cart, key)
        payments.charge(order.total)
        return orders.save(db, order)`,
    notes: [
      { text: RETRY, lines: "2-3" },
      { text: "Only then charge. Inside `with db.begin()`, the order and the payment both happen — or neither does.", lines: "8-11" },
    ],
    test: "test_checkout_is_idempotent",
    testResult: "3 passed in 0.41s",
    testCmd: "$ pytest",
    testText: "Unit and integration tests with pytest.",
    terminal: `$ pytest
==== 42 passed in 3.18s ====
$ docker compose up -d
Uvicorn running on http://0.0.0.0:8000`,
  },

  javascript: {
    label: "JavaScript",
    tabs: ["checkout.js", "db.js", "package.json"],
    hero: `import express from "express";
import { db } from "./db.js";

export const router = express.Router();

router.post("/checkout", async (req, res) => {
  const key = req.get("Idempotency-Key");
+ const existing = await db.order.findUnique({ where: { key } });
+ if (existing) return res.json(existing);
+ if (!req.body.items?.length) throw new EmptyCartError();
+ const order = await placeOrder(req.body, key);
+ res.status(201).json(order);
});`,
    status: ["Node 22", "ESM", "● 42 tests passing"],
    stack: ["Node.js 22", "Express", "PostgreSQL 16", "Prisma", "Vitest", "Docker"],
    codeFile: "checkout.js",
    codePath: "src/orders",
    code: `export async function checkout(cart, key) {
  const existing = await db.order.findUnique({ where: { key } });
  if (existing) {
    return existing;
  }
  if (cart.items.length === 0) throw new EmptyCartError();

  return db.$transaction(async (tx) => {
    await payments.charge(cart.total);
    return tx.order.create({ data: { ...cart, key } });
  });
}`,
    notes: [
      { text: RETRY, lines: "2-5" },
      { text: "Only then charge. Inside `db.$transaction`, the order and the payment both happen — or neither does.", lines: "8-11" },
    ],
    test: "checkout.test.js",
    testResult: "3 passed · 0.41s",
    testCmd: "$ npm test",
    testText: "Unit and integration tests with Vitest.",
    terminal: `$ npm test
 Tests  42 passed (42)
$ docker compose up -d
Server listening on http://localhost:3000`,
  },

  typescript: {
    label: "TypeScript",
    tabs: ["order.service.ts", "order.entity.ts", "tsconfig.json"],
    hero: `import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class OrderService {
  constructor(private readonly db: PrismaService) {}

  async checkout(cart: Cart, key: string): Promise<Order> {
+   const existing = await this.db.order.findUnique({ where: { key } });
+   if (existing) return existing;
+   if (!cart.items.length) throw new EmptyCartError();
+   return this.place(cart, key);
  }
}`,
    status: ["TypeScript 5", "Node 22", "● 42 tests passing"],
    stack: ["TypeScript 5", "NestJS", "PostgreSQL 16", "Prisma", "Vitest", "Docker"],
    codeFile: "order.service.ts",
    codePath: "src/orders",
    code: `async checkout(cart: Cart, key: string): Promise<Order> {
  const existing = await this.db.order.findUnique({ where: { key } });
  if (existing) {
    return existing;
  }
  if (cart.items.length === 0) throw new EmptyCartError();

  return this.db.$transaction(async (tx) => {
    await this.payments.charge(cart.total);
    return tx.order.create({ data: { ...cart, key } });
  });
}`,
    notes: [
      { text: RETRY, lines: "2-5" },
      { text: "Only then charge. Inside `$transaction`, the order and the payment both happen — or neither does.", lines: "8-11" },
    ],
    test: "order.service.spec.ts",
    testResult: "3 passed · 0.41s",
    testCmd: "$ npm test",
    testText: "Unit and integration tests with Vitest.",
    terminal: `$ npm test
 Tests  42 passed (42)
$ docker compose up -d
Nest application successfully started`,
  },

  go: {
    label: "Go",
    tabs: ["service.go", "order.go", "go.mod"],
    hero: `package orders

type Service struct {
    db       *sql.DB
    payments PaymentGateway
}

func (s *Service) Checkout(ctx context.Context, cart Cart, key string) (*Order, error) {
+   if o, err := s.findByKey(ctx, key); err == nil {
+       return o, nil
+   }
+   if len(cart.Items) == 0 {
+       return nil, ErrEmptyCart
+   }
    return s.place(ctx, cart, key)
}`,
    status: ["Go 1.23", "UTF-8", "● 42 tests passing"],
    stack: ["Go 1.23", "chi", "PostgreSQL 16", "sqlc", "testcontainers-go", "Docker"],
    codeFile: "service.go",
    codePath: "internal/orders",
    code: `func (s *Service) Checkout(ctx context.Context, cart Cart, key string) (*Order, error) {
    if o, err := s.findByKey(ctx, key); err == nil {
        return o, nil
    }
    if len(cart.Items) == 0 {
        return nil, ErrEmptyCart
    }
    return withTx(ctx, s.db, func(tx *sql.Tx) (*Order, error) {
        order := NewOrder(cart, key)
        if err := s.payments.Charge(ctx, order.Total); err != nil {
            return nil, err
        }
        return order, insertOrder(ctx, tx, order)
    })
}`,
    notes: [
      { text: RETRY, lines: "2-4" },
      { text: "Only then charge, inside `withTx`: if anything fails, the transaction rolls back and no order is saved.", lines: "8-14" },
    ],
    test: "TestCheckoutIsIdempotent",
    testResult: "ok · 0.41s",
    testCmd: "$ go test ./...",
    testText: "Unit and integration tests with testcontainers-go.",
    terminal: `$ go test ./...
ok      shop/internal/orders    0.412s
$ docker compose up -d
listening on :8080`,
  },

  rust: {
    label: "Rust",
    tabs: ["checkout.rs", "order.rs", "Cargo.toml"],
    hero: `use axum::{extract::State, http::HeaderMap, Json};
use sqlx::PgPool;

pub async fn checkout(
    State(db): State<PgPool>,
    headers: HeaderMap,
    Json(cart): Json<Cart>,
) -> Result<Json<Order>, AppError> {
    let key = idempotency_key(&headers)?;
+   if let Some(order) = orders::find_by_key(&db, &key).await? {
+       return Ok(Json(order));
+   }
+   let order = place_order(&db, cart, key).await?;
+   Ok(Json(order))
}`,
    status: ["Rust 1.82", "UTF-8", "● 42 tests passing"],
    stack: ["Rust 1.82", "axum", "Tokio", "PostgreSQL 16", "sqlx", "Docker"],
    codeFile: "checkout.rs",
    codePath: "src/orders",
    code: `pub async fn checkout(db: &PgPool, cart: Cart, key: String) -> Result<Order> {
    if let Some(order) = orders::find_by_key(db, &key).await? {
        return Ok(order);
    }
    ensure!(!cart.items.is_empty(), "cart is empty");

    let mut tx = db.begin().await?;
    let order = orders::insert(&mut tx, &cart, &key).await?;
    payments::charge(order.total).await?;
    tx.commit().await?;
    Ok(order)
}`,
    notes: [
      { text: RETRY, lines: "2-4" },
      { text: "Only then charge. The order is written inside `db.begin()`; if the charge fails, `tx` is dropped and nothing is saved.", lines: "7-10" },
    ],
    test: "checkout_is_idempotent",
    testResult: "3 passed · 0.41s",
    testCmd: "$ cargo test",
    testText: "Unit and integration tests against a real database.",
    terminal: `$ cargo test
test result: ok. 42 passed; 0 failed
$ docker compose up -d
listening on 0.0.0.0:8080`,
  },

  csharp: {
    label: "C#",
    tabs: ["OrderService.cs", "Order.cs", "appsettings.json"],
    hero: `namespace Shop.Orders;

public class OrderService(ShopDb db, IPaymentGateway payments)
{
    public async Task<Order> CheckoutAsync(Cart cart, string key)
    {
+       var existing = await db.Orders.SingleOrDefaultAsync(o => o.Key == key);
+       if (existing is not null) return existing;
+       if (cart.IsEmpty) throw new EmptyCartException();
+       return await PlaceAsync(cart, key);
    }
}`,
    status: [".NET 8", "C# 12", "● 42 tests passing"],
    stack: [".NET 8", "ASP.NET Core", "PostgreSQL 16", "EF Core", "xUnit", "Docker"],
    codeFile: "OrderService.cs",
    codePath: "src/Shop/Orders",
    code: `public async Task<Order> CheckoutAsync(Cart cart, string key)
{
    var existing = await db.Orders.SingleOrDefaultAsync(o => o.Key == key);
    if (existing is not null) return existing;
    if (cart.IsEmpty) throw new EmptyCartException();

    await using var tx = await db.Database.BeginTransactionAsync();
    var order = Order.From(cart, key);
    await payments.ChargeAsync(order.Total);
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    await tx.CommitAsync();
    return order;
}`,
    notes: [
      { text: RETRY, lines: "3-4" },
      { text: "Only then charge, inside a transaction: the order and the payment both happen — or neither does.", lines: "7-12" },
    ],
    test: "CheckoutIsIdempotent",
    testResult: "3 passed · 0.41s",
    testCmd: "$ dotnet test",
    testText: "Unit and integration tests with xUnit.",
    terminal: `$ dotnet test
Passed!  - Failed: 0, Passed: 42, Skipped: 0
$ docker compose up -d
Now listening on: http://localhost:8080`,
  },
} satisfies Record<string, CodeSample>;

export type CodeLanguage = keyof typeof CODE_SAMPLES;

/** The sample for a language id, Java for anything unknown. */
export function codeSample(id: string | undefined): CodeSample {
  return CODE_SAMPLES[id as CodeLanguage] ?? CODE_SAMPLES.java;
}
