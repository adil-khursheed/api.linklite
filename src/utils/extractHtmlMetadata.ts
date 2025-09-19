import * as cheerio from "cheerio";
import axios from "axios";

export const extractHtmlMetadata = async (url: string) => {
  try {
    const parsedUrl = new URL(url);

    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata = {
      title: "",
      description: "",
      image: "",
      favicon: "",
      url: url,
      siteName: "",
    };

    // Title (Priority: og:title > twitter:title > title tag)
    metadata.title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      "";

    // Description (Priority: og:description > twitter:description > meta description)
    metadata.description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // Image (Priority: og:image > twitter:image)
    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";

    // Convert relative URLs to absolute
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = new URL(imageUrl, parsedUrl.origin).href;
    }
    metadata.image = imageUrl;

    // Site Name
    metadata.siteName =
      $('meta[property="og:site_name"]').attr("content") || parsedUrl.hostname;

    // Favicon (Priority: apple-touch-icon > icon > shortcut icon)
    let faviconUrl =
      $('link[rel="apple-touch-icon"]').attr("href") ||
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      "/favicon.ico";

    // Convert relative URLs to absolute
    if (faviconUrl && !faviconUrl.startsWith("http")) {
      faviconUrl = new URL(faviconUrl, parsedUrl.origin).href;
    }
    metadata.favicon = faviconUrl;

    // Clean up text content
    metadata.title = metadata.title.trim();
    metadata.description = metadata.description.trim();

    return metadata;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error extracting metadata:", err.message);
      throw new Error(`Failed to extract metadata: ${err.message}`);
    } else {
      console.error("Unknown error extracting metadata:", err);
      throw new Error("Failed to extract metadata: Unknown error");
    }
  }
};
