const dotenv = require("dotenv");

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
  case "production":
    ENV_FILE_NAME = ".env.production";
    break;
  case "staging":
    ENV_FILE_NAME = ".env.staging";
    break;
  case "test":
    ENV_FILE_NAME = ".env.test";
    break;
  case "development":
  default:
    ENV_FILE_NAME = ".env";
    break;
}

try {
  dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
  process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const BACKEND_URL = process.env.BACKEND_URL || "localhost:9000"
const ADMIN_URL = process.env.ADMIN_URL || "localhost:7000"
const STORE_URL = process.env.STORE_URL || "localhost:8000"
 
const GoogleClientId = process.env.GOOGLE_CLIENT_ID || ""
const GoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET || ""
const plugins = [
  `medusa-fulfillment-manual`,
  `medusa-payment-manual`,
  {
    resolve: `@medusajs/file-local`,
    options: {
      upload_dir: "uploads",
    },
  },
  {
    resolve: `medusa-file-spaces`,
    options: {
        spaces_url: process.env.SPACE_URL,
        bucket: process.env.SPACE_BUCKET,
        region: process.env.SPACE_REGION,
        endpoint: process.env.SPACE_ENDPOINT,
        access_key_id: process.env.SPACE_ACCESS_KEY_ID,
        secret_access_key: process.env.SPACE_SECRET_ACCESS_KEY,
    },
  },
  {
    resolve: `medusa-plugin-sendgrid`,
    options: {
      api_key: process.env.SENDGRID_API_KEY,
      from: process.env.SENDGRID_FROM,
      order_placed_template: 
        process.env.SENDGRID_ORDER_PLACED_ID,
        user_password_reset_template:process.env.SENDGRID_USER_PASSWORD_RESET_ID,
        customer_password_reset_template:process.env.SENDGRID_CUSTOMER_PASSWORD_RESET_ID,
    },
  },
  {
    resolve: "@medusajs/admin",
    /** @type {import('@medusajs/admin').PluginOptions} */
    options: {
      autoRebuild: true,
      develop: {
        open: process.env.OPEN_BROWSER !== "false",
      },
    },
  },
  {
    resolve: "medusa-plugin-auth",
    /** @type {import('medusa-plugin-auth').AuthOptions} */
    options: [
      {
        type: "google",
        // strict: "all", // or "none" or "store" or "admin"
        strict: "none",
        identifier: "google",
        clientID: GoogleClientId,
        clientSecret: GoogleClientSecret,
        admin: {
          callbackUrl: `https://backend.pixelsjourney.com/admin/auth/google/cb`,
          failureRedirect: `${ADMIN_URL}/login`,
          // The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
          // This query param will have the priority over this configuration
          successRedirect: `https://pixelsjourney.com/`
          // authPath: '/admin/auth/google',
          // authCallbackPath: '/admin/auth/google/cb',
          // expiresIn: 24 * 60 * 60 * 1000,
          // verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
          //    // implement your custom verify callback here if you need it
          // },
        },
        store: {
          callbackUrl: `https://backend.pixelsjourney.com/store/auth/google/cb`,
          failureRedirect: `https://${STORE_URL}/login`,
          // The success redirect can be overriden from the client by adding a query param `?redirectTo=your_url` to the auth url
          // This query param will have the priority over this configuration
          successRedirect: `https://pixelsjourney.com/`
          // authPath: '/store/auth/google',
          // authCallbackPath: '/store/auth/google/cb',
          // expiresIn: 24 * 60 * 60 * 1000,
          // verifyCallback: (container, req, accessToken, refreshToken, profile, strict) => {
          //    // implement your custom verify callback here if you need it
          // },
        }
      }
    ]
    },
    {
      resolve: `medusa-custom-attributes`,
      options: {
        enableUI: true,
        projectConfig: {
          store_cors: STORE_CORS,
          admin_cors: ADMIN_CORS,
        },
      },
    },
    {
      resolve: `medusa-plugin-algolia`,
      options: {
        applicationId: process.env.ALGOLIA_APP_ID,
        adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY,
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: [
                'title',
                'description',
                'material',
                'tags',
                "collection_title",
                "collection_handle",
                "handle",
                "meta_title_he", // Make sure these are included to be retrievable
                "meta_title_ru",
                "meta_title_en",
                "meta_desc_en",
                "meta_desc_he",
                "meta_desc_ru",
              ],
              attributesToRetrieve: [
                "id",
                "title",
                "description",
                "handle",
                "thumbnail",
                "subtitle",
                "tags",
                "material",
                "variants",
                "variant_sku",
                "options",
                "collection_title",
                "collection_handle",
                "images",
                "meta_title_he", // Make sure these are included to be retrievable
                "meta_title_ru",
                "meta_title_en",
                "meta_desc_en",
                "meta_desc_he",
                "meta_desc_ru",
              ],
            },
            transformer: (item) => {
              // Extract titles and descriptions directly from item.metadata
              return {
                objectID: item.id,
                title: item.title,
                handle: item.handle,
                thumbnail: item.thumbnail,
                subtitle: item.subtitle,
                tags: item.tags,
                description: item.description,
                material: item.material,
                metadata: item.metadata, // Keep the original metadata as well if needed
                collection_title: item.collection ? item.collection.title : "", // Adjusted to avoid potential undefined access
                collection_handle: item.collection ? item.collection.handle : "", // Adjusted to avoid potential undefined access
                // Directly assign localized titles and descriptions from metadata
                meta_title_he: item.metadata?.title_he ??  null,
                meta_title_ru: item.metadata?.title_ru  ?? null,
                meta_title_en: item.metadata?.title_en ?? null,
                meta_desc_he: item.metadata?.desc_he ??  null,
                meta_desc_ru: item.metadata?.desc_ru  ?? null,
                meta_desc_en: item.metadata?.desc_en ?? null,
              };
            },
          },
        },
      },
    }
    

];

const modules = {
  eventBus: {
    resolve: "@medusajs/event-bus-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
  cacheService: {
    resolve: "@medusajs/cache-redis",
    options: {
      redisUrl: REDIS_URL
    }
  },
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
  jwtSecret: process.env.JWT_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  store_cors: STORE_CORS,
  database_url: DATABASE_URL,
  admin_cors: ADMIN_CORS,
  // Uncomment the following lines to enable REDIS
  // redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
  featureFlags: {
    product_categories: true
  },
  projectConfig,
  plugins,
  modules,
};
