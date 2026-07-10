// @vitest-environment node
import { Matchers, Pact } from "@pact-foundation/pact";
import { API } from "./api";
import { Product } from "./product";

const { eachLike, like } = Matchers;

const CONSUMER = "pactflow-example-consumer";
const PROVIDER = process.env.PACT_PROVIDER ?? "pactflow-example-provider";

console.log(`[Pact] Consumer: ${CONSUMER}`);
console.log(`[Pact] Provider: ${PROVIDER}`);

const mockProvider = new Pact({
  consumer: CONSUMER,
  provider: PROVIDER,
});

describe("API Pact test", () => {
  describe("retrieving a product", () => {
    it("ID 10 exists", async () => {
      const expectedProduct = {
        id: "10",
        type: "CREDIT_CARD",
        name: "28 Degrees",
      };

      // Uncomment to see this interaction fail on the provider side
      // const expectedProduct = { id: '10', type: 'CREDIT_CARD', name: '28 Degrees', price: 30.0, newField: 22}

      console.log("[Pact] Setting up interaction: GET /product/10 → 200");
      console.log("[Pact] Provider state: 'a product with ID 10 exists'");
      console.log(
        "[Pact] Expected response shape:",
        JSON.stringify(expectedProduct)
      );

      await mockProvider
        .addInteraction()
        .given("a product with ID 10 exists")
        .uponReceiving("a request to get a product")
        .withRequest("GET", "/product/10", (builder) => {
          builder.headers({
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({
            "Content-Type": "application/json; charset=utf-8",
          });
          builder.jsonBody(like(expectedProduct));
        })
        .executeTest(async (mockserver) => {
          console.log(`[Pact] Mock server started at: ${mockserver.url}`);
          console.log("[Pact] Calling API.getProduct('10')...");

          const api = new API(mockserver.url);
          const product = await api.getProduct("10");

          console.log("[Pact] Response received:", JSON.stringify(product));
          expect(product).toStrictEqual(new Product(expectedProduct));
          console.log("[Pact] Assertion passed ✓");
        });
    });

    it("product does not exist", async () => {
      console.log("[Pact] Setting up interaction: GET /product/11 → 404");
      console.log(
        "[Pact] Provider state: 'a product with ID 11 does not exist'"
      );

      await mockProvider
        .addInteraction()
        .given("a product with ID 11 does not exist")
        .uponReceiving("a request to get a product")
        .withRequest("GET", "/product/11", (builder) => {
          builder.headers({
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(404)
        .executeTest(async (mockserver) => {
          console.log(`[Pact] Mock server started at: ${mockserver.url}`);
          console.log(
            "[Pact] Calling API.getProduct('11') — expecting 404 rejection..."
          );

          const api = new API(mockserver.url);
          await expect(api.getProduct("11")).rejects.toThrow(
            "Request failed with status code 404"
          );
          console.log("[Pact] 404 rejection confirmed ✓");
        });
    });
  });

  describe("retrieving products", () => {
    it("products exists", async () => {
      const expectedProduct = {
        id: "10",
        type: "CREDIT_CARD",
        name: "28 Degrees",
      };

      console.log("[Pact] Setting up interaction: GET /products → 200 (array)");
      console.log("[Pact] Provider state: 'products exist'");
      console.log(
        "[Pact] Expected response shape (eachLike):",
        JSON.stringify(expectedProduct)
      );

      await mockProvider
        .addInteraction()
        .given("products exist")
        .uponReceiving("a request to get all products")
        .withRequest("GET", "/products", (builder) => {
          builder.headers({
            Authorization: like("Bearer 2019-01-14T11:34:18.045Z"),
          });
        })
        .willRespondWith(200, (builder) => {
          builder.headers({
            "Content-Type": "application/json; charset=utf-8",
          });
          builder.jsonBody(eachLike(expectedProduct));
        })
        .executeTest(async (mockserver) => {
          console.log(`[Pact] Mock server started at: ${mockserver.url}`);
          console.log("[Pact] Calling API.getAllProducts()...");

          const api = new API(mockserver.url);
          const products = await api.getAllProducts();

          console.log(
            `[Pact] Response received: ${products.length} product(s) —`,
            JSON.stringify(products)
          );
          expect(products).toStrictEqual([new Product(expectedProduct)]);
          console.log("[Pact] Assertion passed ✓");
        });
    });
  });
});
